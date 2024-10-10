let app = new Vue({
    el: "#app",
    data: {
        sitename: "Lesson Booking",
        lessons: [
            { id: 1, subject: "Math", location: "Room 101", price: 50, spaces: 3, image: "images/maths.png" },
            { id: 2, subject: "Science", location: "Room 102", price: 60, spaces: 5, image: "images/science.jpg" },
            { id: 3, subject: "History", location: "Room 103", price: 40, spaces: 2, image: "images/history.jpeg" },
            { id: 4, subject: "English", location: "Room 104", price: 45, spaces: 0, image: "images/english.png" },
            { id: 5, subject: "Art", location: "Room 105", price: 55, spaces: 4, image: "images/art.jpg" },
            { id: 6, subject: "Music", location: "Room 106", price: 70, spaces: 1, image: "images/music.png" },
            { id: 7, subject: "Physics", location: "Room 107", price: 65, spaces: 5, image: "images/physics.png" },
            { id: 8, subject: "Chemistry", location: "Room 108", price: 50, spaces: 0, image: "images/chemistry.jpeg" },
            { id: 9, subject: "Biology", location: "Room 109", price: 60, spaces: 2, image: "images/biology.png" },
            { id: 10, subject: "Geography", location: "Room 110", price: 50, spaces: 3, image: "images/geography.jpg" }
        ]
    },
    methods: {
        bookSpace(lesson) {
            if (lesson.spaces > 0) {
                lesson.spaces--;
            }
        }
    }
});
