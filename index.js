const express = require('express');

const app = express();
const cors = require('cors');


app.use(express.json());
app.use(cors());

const PORT=process.env.PORT || 3001;
const { run, getAllSeats, BookEmptySeats,changeStatus} = require('./db');


//  changeStatus();

app.get('/', async (req, res) => {

   try {

      const data = await getAllSeats();
      
      res.json(data);
   }

   catch (error) {

      res.status(400).json("Server Error");
   }
})


app.put('/bookSeats', async (req, res) => {


   const { NumberofSeats } = req.body // Number of Seats to be booked,max:7

     
    if(NumberofSeats<=0)
    {
      res.status(500).json("Please enter some valid input");
    }


   else if (NumberofSeats > 7) {
      res.status(500).json("Limit Exceed (User can book only 7 seats at a time)");
   }

   else {
      try {

         
         
          const BookedSeats = await BookEmptySeats(NumberofSeats);

         // console.log(BookedSeats);

           if(BookedSeats.length==0)
             {
               res.json(`${NumberofSeats} seats are not Available`);
             }

             else{

         const collection = await run();
         const filter = { SeatNo: { $in: BookedSeats } };
         const update = { $set: { Status: "Not Available" } };
         const data = await collection.updateMany(filter, update)
         // console.log(data);
         res.json("Your Seat "+BookedSeats);
             }
      }
      catch (error) {
         res.status(500).json("Server Error");
      }
   }
})


app.listen(PORT, () => {

   console.log(`Backend Server started at port ${PORT}`);
})