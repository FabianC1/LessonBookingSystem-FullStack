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
        searchQuery: "",
        cart: [],
        cartVisible: false,
        showLessonPage: true,
        name: '',
        phone: '',
        checkoutMessage: '',
    },
    created() {
        // Fetch lessons from the server
        fetch("http://localhost:3000/lessons")
            .then(response => response.json())
            .then(data => {
                this.lessons = data; // Populate lessons with fetched data
            })
            .catch(error => console.error("Error fetching lessons:", error));
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

                // New search functionality
                const searchValid = lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase());

                return priceValid && (!this.excludeFull || lesson.spaces > 0) && searchValid;
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
                lesson.spaces--;
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
            if (this.checkoutEnabled) {
                this.checkoutMessage = `Order has been submitted for ${this.name} with phone number ${this.phone}.`;
                this.name = ''; // Reset the name field
                this.phone = ''; // Reset the phone field
                this.cart = []; // Clear the cart after checkout
            }
        },

        getLessonLocation(lessonId) {
            const lesson = this.lessons.find(lesson => lesson.id === lessonId);
            return lesson ? lesson.location : "Unknown Location"; // Fallback in case lesson is not found
        },
    }
});
