let app = new Vue({
    el: "#app",
    data: {
        sitename: "Book your lesson",
        lessons: [
            { id: 1, subject: "Math", location: "Room 101", price: 50, spaces: 3, image: "images/maths.png", duration: 2 },
            { id: 2, subject: "Science", location: "Room 102", price: 60, spaces: 5, image: "images/science.jpg", duration: 1.5 },
            { id: 3, subject: "History", location: "Room 103", price: 40, spaces: 2, image: "images/history.jpeg", duration: 1 },
            { id: 4, subject: "English", location: "Room 104", price: 45, spaces: 0, image: "images/english.png", duration: 2 },
            { id: 5, subject: "Art", location: "Room 105", price: 55, spaces: 4, image: "images/art.jpg", duration: 2.5 },
            { id: 6, subject: "Music", location: "Room 106", price: 70, spaces: 1, image: "images/music.png", duration: 1.5 },
            { id: 7, subject: "Physics", location: "Room 107", price: 65, spaces: 5, image: "images/physics.png", duration: 2 },
            { id: 8, subject: "Chemistry", location: "Room 108", price: 50, spaces: 0, image: "images/chemistry.jpeg", duration: 1.5 },
            { id: 9, subject: "Biology", location: "Room 109", price: 60, spaces: 2, image: "images/biology.png", duration: 1 },
            { id: 10, subject: "Geography", location: "Room 110", price: 50, spaces: 3, image: "images/geography.jpg", duration: 2 }
        ],
        sortAttribute: "subject", // Default sort by subject
        sortOrder: "ascending", // Default order
        minPrice: null,
        maxPrice: null,
        excludeFull: false,
        priceError: null,
        searchQuery: "",
    },
    computed: {
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
        }
    },
    methods: {
        bookSpace(lesson) {
            if (lesson.spaces > 0) {
                lesson.spaces--;
            }
        },
        validatePrices() {
            if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
                this.priceError = "Min Price cannot be greater than Max Price.";
            } else {
                this.priceError = null;
            }
        },
        applyChanges() {
            this.validatePrices();
        },
        resetChanges() {
            this.minPrice = null;
            this.maxPrice = null;
            this.excludeFull = false;
            this.priceError = null;
        }
    }
});
