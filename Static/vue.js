let app = new Vue({
    el: "#app",
    data: {
        sitename: "Book your lesson",
        lessons: [], // Initialize as an empty array
        sortAttribute: "subject", // Default sort by subject
        sortOrder: "ascending", // Default order
        minPrice: null,
        maxPrice: null,
        excludeFull: false,
        priceError: null,
        cart: [],
        cartVisible: false,
        showLessonPage: true,
        name: '',
        phone: '',
        checkoutMessage: '',
    },
    
    created() {
        const collectionName = "products";
        fetch(`http://localhost:3000/collections/${collectionName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                this.lessons = data;
                this.updateLessonsFromCart();
            })
            .catch(error => console.error("Error fetching data:", error));
    },

    computed: {
        isCartDisabled() {
            return this.cart.length === 0 && this.showLessonPage;
        },

        cartTotal() {
            return this.cart.reduce((total, item) => total + item.price, 0);
        },

        filteredLessons() {
            return this.lessons.filter(lesson => {
                let priceValid = true;
                if (this.minPrice !== null && lesson.price < this.minPrice) {
                    priceValid = false;
                }
                if (this.maxPrice !== null && lesson.price > this.maxPrice) {
                    priceValid = false;
                }

                return priceValid && (!this.excludeFull || lesson.spaces > 0);  // Adjusted to remove search filter. Only backend search works.
            }).sort((a, b) => {
                let modifier = this.sortOrder === "ascending" ? 1 : -1;
                if (this.sortAttribute === "price" || this.sortAttribute === "spaces" || this.sortAttribute === "duration") {
                    return (a[this.sortAttribute] - b[this.sortAttribute]) * modifier;
                } else {
                    let aValue = a[this.sortAttribute].toLowerCase();
                    let bValue = b[this.sortAttribute].toLowerCase();
                    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
                }
            });
        },

        checkoutEnabled() {
            const nameRegex = /^[A-Za-z\s]+$/; // Allow only letters and spaces
            const phoneRegex = /^[0-9]+$/; // Allow only numbers
            return nameRegex.test(this.name) && phoneRegex.test(this.phone);
        }
    },

    methods: {
        handleSearch(event) {
            const searchTerm = event.target.value.trim(); // Clean up the search term
            if (searchTerm) {
                // Send search request to the backend
                fetch(`/search?q=${searchTerm}`)
                    .then(response => response.json())
                    .then(data => {
                        this.lessons = data;  // Update lessons with the search results from backend
                    })
                    .catch(error => console.error("Search error:", error));
            } else {
                this.lessons = [];  // Clear lessons if no search term
            }
        },

        toggleCart() {
            this.showLessonPage = !this.showLessonPage; // Toggle the page
        },

        bookSpace(lesson) {
            if (lesson.spaces > 0) {
                this.cart.push({
                    id: `${lesson.id}-${Date.now()}`,
                    subject: lesson.subject,
                    price: lesson.price,
                    lessonId: lesson.id
                });

                lesson.spaces--; // Decrease available spaces locally (front-end)
            } else {
                alert("This lesson is full!");
            }
        },

        removeFromCart(itemToRemove) {
            const lesson = this.lessons.find(lesson => lesson.id === itemToRemove.lessonId);
            if (lesson) {
                lesson.spaces++; // Increase the number of spaces in the original lesson
            }
            this.cart = this.cart.filter(item => item.id !== itemToRemove.id); // Remove the specific item with IDs
        },

        validatePrices() {
            // Ensuring minPrice and maxPrice are not below 0
            if (this.minPrice < 0) {
                this.minPrice = 0;
            }
            if (this.maxPrice < 0) {
                this.maxPrice = 0;
            }

            // Checking for Min Price greater than Max Price
            if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
                this.priceError = "Min Price cannot be greater than Max Price.";
            } else {
                this.priceError = null; // Clear error if validation passes
            }
        },

        applyChanges() {
            this.validatePrices(); // Call validation on apply
        },

        resetChanges() {
            this.minPrice = null; // Reset prices
            this.maxPrice = null;
            this.excludeFull = false; // Reset checkbox
            this.priceError = null; // Clear error message
        },

        submitOrder() {
            if (this.checkoutEnabled && this.cart.length > 0) {
                // Collect order details
                const orderData = {
                    name: this.name,
                    phone: this.phone,
                    lessons: this.cart.map(item => ({
                        lessonId: item.lessonId,
                        price: item.price,
                        spaces: 1, // Each item represents one space
                        subject: item.subject,
                    })),
                };

                // Upload the order first
                this.uploadOrder(orderData);

                // Update lesson spaces after submitting the order
                this.cart.forEach(item => {
                    const lesson = this.lessons.find(lesson => lesson.id === item.lessonId);
                    if (lesson && lesson.spaces >= 0) {
                        const updatedSpaces = lesson.spaces;

                        // Update the lesson availability in the database
                        fetch(`http://localhost:3000/collections/products/${lesson._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ spaces: updatedSpaces }),
                        })
                            .then(response => response.json())
                            .then(updatedLesson => {
                                console.log("Lesson updated:", updatedLesson);
                            })
                            .catch(error => {
                                console.error("Error updating lesson:", error);
                            });
                    }
                });

                // Show confirmation message and update the flag
                this.checkoutMessage = `Order has been submitted for ${this.name} with phone number ${this.phone}.`;
                this.isOrderSubmitted = true; // Set flag to true when order is submitted

                // Clear the cart after checkout
                this.cart = [];
                this.name = '';
                this.phone = '';
            } else {
                alert("Please fill in all fields and ensure you have items in your cart.");
            }
        },

        uploadOrder(orderData) {
            // Submit the order to the backend (to create a new order in the database)
            fetch('http://localhost:3000/collections/Orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })
                .then(response => response.json())
                .then(result => {
                    if (result && result._id) { // Ensure order was successfully created
                        console.log("Order successfully created:", result);
                    } else {
                        console.error('Error submitting order:', result.error);
                    }
                })
                .catch(error => {
                    console.error('Error with order submission:', error);
                });
        },

        getLessonLocation(lessonId) {
            const lesson = this.lessons.find(lesson => lesson.id === lessonId);
            return lesson ? lesson.location : "Unknown Location"; // Fallback in case lesson is not found
        },
    }
});


