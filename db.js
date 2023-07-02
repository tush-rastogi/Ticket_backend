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
    // console.log(NumberofSeats);
    const collection = await run();
    const EmptySeats = await collection.find({ Status: "Available" }).toArray();
    //  console.log(EmptySeats);

         if(NumberofSeats>EmptySeats.length)
          return [];
         

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

    

      let row;
      let min=10;

       let flag=false;

        // Logic to book Seats in a Row   
      for(let [key,value] of map){            // key:Integer,value:Array

          if(NumberofSeats>value.length)
          continue;

           else{
               
               const x=value.length-NumberofSeats;

                 if(x<min){
                    min=x;
                    row=key;
                 }

                 flag=true;
           }

      }

         if(flag)
       return map.get(row).slice(0,NumberofSeats);

       else  // logic to book nearby Seats 
       {

        const ArrayMap = Array.from(map.entries());  // convert the map into array

        ArrayMap.sort((a,b)=>a[0]-b[0]);             // sort the array in ascending order of key 
         let map3=new Map();
          for(let i=0;i<ArrayMap.length;i++)
          {
            
              let min=20;
              let max=0;

              
              min=Math.min(min,ArrayMap[i][0]);
              max=Math.max(max,ArrayMap[i][0]);
              
               let map2=new Map();
               let z=NumberofSeats;

                if(z>ArrayMap[i][1].length)
                {
                     
                   z-=ArrayMap[i][1].length;

                    map2.set(ArrayMap[i][0],ArrayMap[i][1].length)

                }

                 else
                 {
                   
                    map2.set(ArrayMap[i][0],z);
                    z=0;
                 }  
             
                //    console.log("First Loop ",map2)
                 
              for(let j=i+1;j<ArrayMap.length;j++)
              {

                   if(z==0)
                   break;
                
                min=Math.min(min,ArrayMap[j][0]);
                max=Math.max(max,ArrayMap[j][0]);
                
                
                if(z>ArrayMap[j][1].length)
                {
                     
                   z-=ArrayMap[j][1].length;

                    map2.set(ArrayMap[j][0],ArrayMap[j][1].length)

                }

                 else
                 {
                    // array.push(z);
                    // z=0;
                    map2.set(ArrayMap[j][0],z);
                    z=0;
                 }  
  

              }

                if(z>0)
                continue;

               
                if(map3.has(max-min))
                continue;

                 else
                 map3.set(max-min,map2);

          }

            // console.log(map3)

               let MIN=20;

             for(const [key,value] of map3)
             {

                 MIN=Math.min(MIN,key);

             }

            //   console.log(MIN)
              let SeatsTobeBooked=[]

                // console.log(map3.get(MIN))
               for(let [x,y] of map3.get(MIN)){

                    
                      for(let i=0;i<y;i++)
                       SeatsTobeBooked.push(map.get(x)[i]);
                     
               }

               return SeatsTobeBooked;

       }

}

async function changeStatus(){


       const collection =await run();

         const filter={SeatNo:"I5"}
          const update={$set:{Status:"Not Available"}}

           collection.updateMany(filter,update);
          
}

module.exports = {
    run,
    getAllSeats,
    BookEmptySeats,
    changeStatus
    
    
};

