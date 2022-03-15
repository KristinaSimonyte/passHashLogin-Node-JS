const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const PORT = process.env.SERVER_PORT || 3000;

const app = express();

const users = [
  {
    id: 1,
    username: 'Mike',
    password: 'secret',
  },
  {
    id: 2,
    username: 'James',
    password: 'jam',
  },
];

// middleware

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/users', (req, res) => {
  res.json(users);
});

// GET users/:username (grazinti vartotoja kurio username  === username)
app.get('/users/:username', (req, res) => {
  const name = req.params.username;
  const userObjFound = users.find((userObj) => userObj.username === name);
  res.json(userObjFound);
});

app.post('/login', (req, res) => {
  // gauti username ir password su kuriais bandoma prisiloginti
  const { username, password } = req.body;
  // surasti vartotoja vardu username
  const userObjFound = users.find((userObj) => userObj.username === username);
  // jei randam ziurim ar sutampa slaptazodziai
  // verify password
  // if (bcrypt.compareSync(password, userObjFound.password)) {
  //   console.log('sutampa');
  // }
  if (userObjFound && bcrypt.compareSync(password, userObjFound.password)) {
    res.json('login success');
  } else {
    res.status(400).send('username or password not match');
  }
});

app.post('/register', (req, res) => {
  // gauti username ir password su kuriais bandoma prisiregistruoti
  const { username, password } = req.body;
  const passHash = bcrypt.hashSync(password, 10);
  const newUser = {
    username,
    password: passHash,
  };
  users.push(newUser);
  res.send('register success');
});

const schema = Joi.object({
  email: Joi.string().email().required(),
  town: Joi.string().min(4).max(30).pattern(new RegExp('[a-zA-Z]$')).required(),
  age: Joi.number().min(18).max(200).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
});
// POST /validate (atsiusti situo adresu objekta)
app.post('/validate', async (req, res) => {
  const newUser = req.body;
  // validate input
  try {
    await schema.validateAsync(newUser, { abortEarly: false });
  } catch (error) {
    console.log('klaida validuojant');
    console.log('error ===, error');
    res.status(400).json({
      error: 'Please check inputs',
      errors: error.details.map((dtl) => dtl.message),
    });
    return;
  }

  // const newUser = {
  //   email: 'james@james', // valid email, required
  //   town: 'Kaunas', // min 4, max 30, tik raides, required
  //   age: 25, // min 18, max 200, number, required
  //   gender: 'male', // galimi tik 2 variantai male ir female
  // };
  // console.log(JSON.stringify(newUser));
  res.json(newUser);
});

// atsakyti su gautu objektu
app.listen(PORT, () => console.log(`Server id running on port ${PORT}`));
