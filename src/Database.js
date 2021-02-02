import firebase from "firebase";

export class Database {

    /**
     * load
     * Loads all user data into a given container
     *
     * @param dbPath - the path in firebase
     * @param callback - the function that will be called on data return which has a single parameter with the value in it
     * /users/.....
     */
    read(dbPath, callback) {
        // load data
        firebase.database().ref(dbPath).once("value").then(function (response) {
            callback(response.val());
        });
    }

    /**
     * write
     * Writes data to the real time database
     *
     * @param dbPath - the path in firebase
     * @param postData - data to send
     */
    write(dbPath, postData) {

        if (firebase.auth().currentUser) {
            //let uid = firebase.auth().currentUser.uid;

            // Get a key for a new Post.
            //let newPostKey = firebase.database().ref().child(dbPath).push().key;

            // Write the new post's data simultaneously in the posts list and the user's post list.
            let updates = {};
            updates[dbPath] = postData;

            return firebase.database().ref().update(updates);
        } else {
            return false;
        }
    }

    /**
     * delete
     * Deletes data in the real time database
     *
     * @param dbPath - the path in firebase
     */
    delete(dbPath) {
        // let uid = firebase.auth().currentUser.uid;
        firebase.database().ref(dbPath).remove();
    }

}