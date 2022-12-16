class Helper {
    /* variables to store database credentials */
    #path;
    #userName;
    #password;
    #databaseName;
    #collection;
    constructor(collection) {
        /* retrieving the credentials to access the database/collection */
        this.#path = require("path");
        require("dotenv").config({path: this.#path.resolve(__dirname, 'private/.env')})
        this.#userName = process.env.MONGO_DB_USERNAME;
        this.#password = process.env.MONGO_DB_PASSWORD;
        this.#databaseName = String(process.env.MONGO_DB_NAME);
        this.#collection = String(process.env.MONGO_COLLECTION);
    }

    /* abstracting lecture MongoDB example code */
    async main(task, data) {
        const { MongoClient, ServerApiVersion } = require('mongodb');
        const databaseAndCollection = {db: this.#databaseName, collection: this.#collection};
        const uri = `mongodb+srv://${this.#userName}:${this.#password}@cluster0.y8nv6vi.mongodb.net/${databaseAndCollection.db}?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();
            return await task(client, databaseAndCollection, data);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    /* adding an entry into the database collection */
    async insertUser(client, databaseAndCollection, userInfo) {
        const user = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(userInfo);
        if (user !== null) {
            return null;
        }
        await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .updateOne({ name: "plot" }, {$inc: {[`y.${userInfo.age}`]: 1}});
        return await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(userInfo);
    }

        /* removing an entry into the database collection */
    async removeUser(client, databaseAndCollection, userInfo) {
        const user = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(userInfo);
        if (user === null) {
            return null;
        }
        await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .updateOne({ name: "plot" }, {$inc: {[`y.${user.age}`]: -1}});
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteOne(userInfo);
        return user;
    }

    /* searching and finding/returning an entry from the database collection */
    async find(client, databaseAndCollection, filter) {
        return await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
    }

    /* searching and finding/returning all entries with a specific characteristic from the database collection */
    async searchUsers(client, databaseAndCollection, age) {
        let filter = { age: { $gte: age } };
        const cursor = client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .find(filter);

        return await cursor.toArray();
    }
}

/* exporting the module */
module.exports = Helper;