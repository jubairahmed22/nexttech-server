const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q0x3ff9.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function sendBookingEmail(booking) {
    const { name, phone, address, email } = booking;


    const auth = {
        auth: {
            api_key: process.env.EMAIL_SEND_KEY,
            domain: process.env.EMAIL_SEND_DOMAIN
        }
    }

    const transporter = nodemailer.createTransport(mg(auth));

    console.log('sending email', email)
    transporter.sendMail({
        from: "jubairahmed060@gmail.com", // verified sender email
        to: 'jubairahmed060@gmail.com' || email, // recipient email
        subject: `Your message is confirmed`, // Subject line
        text: "talha jubair", // plain text body
        html: `
        <h3>Your message is confirmed</h3>
        <div>
        <p>Thanks from NEXTTECHITC.</p>
        <div>
        <p>${name}</p>
        <p>${email}</p>
        <p>${phone}</p>
        <p>${address}</p>
        </div>
        </div>

         `, // html body
    }, function (error, info) {
        if (error) {
            console.log('Email send error', error);
        } else {
            console.log('Email sent: ' + info);
        }
    });
}


async function run() {
    try {
        // const projectDetails = client.db('jubairPortfolio').collection('projectDetails');

        const blogCategory = client.db('nexttech-web').collection('Blogcetagory');
        const allBlogs = client.db('nexttech-web').collection('allBlogs');
        const courses = client.db('nexttech-web').collection('courses');
        const courseDetailsData = client.db('nexttech-web').collection('courseDetails');
        const mailSender = client.db('nexttech-web').collection('mailsender');


        /////////////mailsender start/////////////
        app.get('/mail', async (req, res) => {
            const query = {};
            const options = await mailSender.find(query).toArray();
            res.send(options);
        })

        app.post('/mail', async (req, res) => {
            const order = req.body;
            const result = await mailSender.insertOne(order);
            sendBookingEmail(order)
            res.send(result);
        });

        /////////////mailsender end//////////////


        app.get('/blogCategory', async (req, res) => {
            const query = {};
            const options = await blogCategory.find(query).toArray();
            res.send(options);
        })


        app.get('/blogs', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log(page, size);
            const query = {}
            const cursor = allBlogs.find(query);
            const products = await cursor.skip(page * size).limit(size).toArray();
            const count = await allBlogs.estimatedDocumentCount();
            res.send({ count, products });
        });

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const result = await allBlogs.find(query).toArray();
            res.send(result);
        })

        app.get('/fullStack', async (req, res) => {
            const query = {};
            const options = await allBlogs.find(query).toArray();
            res.send(options);
        })

        app.get('/fullStack/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allBlogs.find(query).toArray();
            res.send(result);
        })



        /////////////Course Start//////////
        app.get('/courses', async (req, res) => {
            const query = {};
            const options = await courses.find(query).toArray();
            res.send(options);
        })

        app.get('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const result = await courses.find(query).toArray();
            res.send(result);
        })
        app.get('/coursedetails', async (req, res) => {
            const query = {};
            const options = await courseDetailsData.find(query).toArray();
            res.send(options);
        })

        app.get('/coursedetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const result = await courseDetailsData.find(query).toArray();
            res.send(result);
        })
        /////////////Course End//////////


    }
    finally {

    }
}

run().catch(err => console.error(err));


app.get('/', async (req, res) => {
    res.send('nexttech server is running');
})

app.listen(port, () => console.log(`nexttech server is running ${port} `))