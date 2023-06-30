const { MongoClient, ServerApiVersion } = require('mongodb');
const password = encodeURIComponent(process.env.password);
const uri = `mongodb+srv://tush17:${password}@cluster0.fbxqa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// This function is used to connect to Database 
async function run() {

    try {
          await client.connect();
        const database = client.db('TicketTracker');
        const collection = database.collection('posts');
        return collection;

    }
    catch (error) {
        console.log("Failed to Connect to Database")
    }

}

// This function return the current status of 80 seats 
async function getAllSeats() {

    const collection = await run();
      const AllSeats= await collection.find().toArray();

    let map = new Map();


    for (let seats of AllSeats) {

        if (map.has(seats.Row)) {

            const arr = map.get(seats.Row);
           
            arr.push(seats);

            map.set(seats.Row, arr);
        }

        else {
            const arr = [];
            arr.push(seats);
            map.set(seats.Row, arr);
        }

    }

    const ArrayMap = Array.from(map.entries());

     return ArrayMap;

}

 // This function books the empty seats on user request
async function BookEmptySeats(NumberofSeats) {
    console.log(NumberofSeats);
    const collection = await run();
    const EmptySeats = await collection.find({ Status: "Available" }).toArray();
    //  console.log(EmptySeats);
    let map = new Map();


    for (let seats of EmptySeats) {

        if (map.has(seats.Row)) {

            const arr = map.get(seats.Row);
            // console.log(typeof(seats.SeatNo))
            arr.push(seats.SeatNo);

            map.set(seats.Row, arr);
        }

        else {
            const arr = [];
            arr.push(seats.SeatNo);
            map.set(seats.Row, arr);
        }

    }

    const ArrayMap = Array.from(map.entries());

    const sortedArrayMap = ArrayMap.sort((a, b) => b[1].length - a[1].length);

    console.log(sortedArrayMap)

    const SeatsTobeBooked = [];


    for (const [a, b] of sortedArrayMap) {

        if (b.length >= NumberofSeats) {


            for (let k of b.slice(0, NumberofSeats))
                SeatsTobeBooked.push(k);

            //    console.log(SeatsTobeBooked[0]);
            return SeatsTobeBooked;
        }

        else if (NumberofSeats > b.length) {


            for (let k of b.slice(0, NumberofSeats))
                SeatsTobeBooked.push(k);

            NumberofSeats -= b.length;
        }


    }


    //  console.log(SeatsTobeBooked)
    return SeatsTobeBooked;

}

module.exports = {
    run,
    getAllSeats,
    BookEmptySeats,
    
    
};

