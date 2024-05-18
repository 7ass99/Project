// server.js

const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nutrient_calculator', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define MongoDB schemas and models
const healthMetricsSchema = new mongoose.Schema({
  age: Number,
  weight: Number,
  height: Number,
  gender: String,
  activityLevel: String,
  bmi: Number,
  bmr: Number,
  tdee: Number
});

const macronutrientsSchema = new mongoose.Schema({
  tdee: Number,
  protein: Number,
  carbs: Number,
  fats: Number
});

const idealWeightSchema = new mongoose.Schema({
  height: Number,
  gender: String,
  minWeight: Number,
  maxWeight: Number
});

const activityClassificationSchema = new mongoose.Schema({
  activityLevel: String,
  classification: String
});

const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);
const Macronutrients = mongoose.model('Macronutrients', macronutrientsSchema);
const IdealWeight = mongoose.model('IdealWeight', idealWeightSchema);
const ActivityClassification = mongoose.model('ActivityClassification', activityClassificationSchema);

app.use(express.json());

// REST Endpoints
app.post('/api/health-metrics', async (req, res) => {
  const { age, weight, height, gender, activityLevel } = req.body;
  const bmi = weight / ((height / 100) ** 2);
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  let activityMultiplier;
  switch (activityLevel.toLowerCase()) {
    case 'sedentary': activityMultiplier = 1.2; break;
    case 'lightly active': activityMultiplier = 1.375; break;
    case 'moderately active': activityMultiplier = 1.55; break;
    case 'very active': activityMultiplier = 1.725; break;
    case 'super active': activityMultiplier = 1.9; break;
    default: activityMultiplier = 1.2;
  }
  const tdee = bmr * activityMultiplier;
  const newHealthMetrics = new HealthMetrics({ age, weight, height, gender, activityLevel, bmi, bmr, tdee });
  await newHealthMetrics.save();
  res.json(newHealthMetrics);
});

app.post('/api/macronutrients', async (req, res) => {
  const { tdee } = req.body;
  const proteinCalories = tdee * 0.30;
  const carbsCalories = tdee * 0.40;
  const fatsCalories = tdee * 0.30;
  const protein = proteinCalories / 4;
  const carbs = carbsCalories / 4;
  const fats = fatsCalories / 9;
  const newMacronutrients = new Macronutrients({ tdee, protein, carbs, fats });
  await newMacronutrients.save();
  res.json(newMacronutrients);
});

app.post('/api/ideal-weight', async (req, res) => {
  const { height, gender } = req.body;
  let idealWeightMin;
  let idealWeightMax;
  if (gender.toLowerCase() === 'male') {
    idealWeightMin = 50 + 0.9 * (height - 152);
    idealWeightMax = 62 + 0.9 * (height - 152);
  } else {
    idealWeightMin = 45.5 + 0.9 * (height - 152);
    idealWeightMax = 56.5 + 0.9 * (height - 152);
  }
  const newIdealWeight = new IdealWeight({ height, gender, minWeight: idealWeightMin, maxWeight: idealWeightMax });
  await newIdealWeight.save();
  res.json(newIdealWeight);
});

app.post('/api/activity-level', async (req, res) => {
  const { activityLevel } = req.body;
  let classification;
  switch (activityLevel.toLowerCase()) {
    case 'sedentary': classification = "Sedentary (little or no exercise)"; break;
    case 'lightly active': classification = "Lightly Active (light exercise/sports 1-3 days/week)"; break;
    case 'moderately active': classification = "Moderately Active (moderate exercise/sports 3-5 days/week)"; break;
    case 'very active': classification = "Very Active (hard exercise/sports 6-7 days a week)"; break;
    case 'super active': classification = "Super Active (very hard exercise/sports & a physical job)"; break;
    default: classification = "Unknown Activity Level";
  }
  const newActivityClassification = new ActivityClassification({ activityLevel, classification });
  await newActivityClassification.save();
  res.json(newActivityClassification);
});

app.get('/api/health-metrics', async (req, res) => {
  try {
    const healthMetrics = await HealthMetrics.find();
    res.json(healthMetrics);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/macronutrients', async (req, res) => {
  try {
    const macronutrients = await Macronutrients.find();
    res.json(macronutrients);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/ideal-weight', async (req, res) => {
  try {
    const idealWeights = await IdealWeight.find();
    res.json(idealWeights);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/activity-level', async (req, res) => {
  try {
    const activityClassifications = await ActivityClassification.find();
    res.json(activityClassifications);
  } catch (err) {
    res.status(500).send(err);
  }
});

// GraphQL schema and resolvers
const schema = buildSchema(`
  type Query {
    healthMetrics(age: Int, weight: Float, height: Float, gender: String, activityLevel: String): HealthMetrics
    macronutrients(tdee: Float): Macronutrients
    idealWeight(height: Float, gender: String): IdealWeight
    activityClassification(activityLevel: String): ActivityClassification
    getHealthMetrics: [HealthMetrics]
    getMacronutrients: [Macronutrients]
    getIdealWeights: [IdealWeight]
    getActivityClassifications: [ActivityClassification]
  }

  type Mutation {
    createHealthMetrics(age: Int, weight: Float, height: Float, gender: String, activityLevel: String): HealthMetrics
    createMacronutrients(tdee: Float, protein: Float, carbs: Float, fats: Float): Macronutrients
    createIdealWeight(height: Float, gender: String, minWeight: Float, maxWeight: Float): IdealWeight
    createActivityClassification(activityLevel: String, classification: String): ActivityClassification
  }

  type HealthMetrics {
    age: Int
    weight: Float
    height: Float
    gender: String
    activityLevel: String
    bmi: Float
    bmr: Float
    tdee: Float
  }

  type Macronutrients {
    tdee: Float
    protein: Float
    carbs: Float
    fats: Float
  }

  type IdealWeight {
    height: Float
    gender: String
    minWeight: Float
    maxWeight: Float
  }

  type ActivityClassification {
    activityLevel: String
    classification: String
  }
`);

const root = {
  healthMetrics: ({ age, weight, height, gender, activityLevel }) => {
    const bmi = weight / ((height / 100) ** 2);
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    let activityMultiplier;
    switch (activityLevel.toLowerCase()) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'lightly active': activityMultiplier = 1.375; break;
      case 'moderately active': activityMultiplier = 1.55; break;
      case 'very active': activityMultiplier = 1.725; break;
      case 'super active': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.2;
    }
    const tdee = bmr * activityMultiplier;
    const newHealthMetrics = new HealthMetrics({ age, weight, height, gender, activityLevel, bmi, bmr, tdee });
    newHealthMetrics.save();
    return newHealthMetrics;
  },
  macronutrients: ({ tdee }) => {
    const proteinCalories = tdee * 0.30;
    const carbsCalories = tdee * 0.40;
    const fatsCalories = tdee * 0.30;
    const protein = proteinCalories / 4;
    const carbs = carbsCalories / 4;
    const fats = fatsCalories / 9;
    const newMacronutrients = new Macronutrients({ tdee, protein, carbs, fats });
    newMacronutrients.save();
    return newMacronutrients;
  },
  idealWeight: ({ height, gender }) => {
    let idealWeightMin;
    let idealWeightMax;
    if (gender.toLowerCase() === 'male') {
      idealWeightMin = 50 + 0.9 * (height - 152);
      idealWeightMax = 62 + 0.9 * (height - 152);
    } else {
      idealWeightMin = 45.5 + 0.9 * (height - 152);
      idealWeightMax = 56.5 + 0.9 * (height - 152);
    }
    const newIdealWeight = new IdealWeight({ height, gender, minWeight: idealWeightMin, maxWeight: idealWeightMax });
    newIdealWeight.save();
    return newIdealWeight;
  },
  activityClassification: ({ activityLevel }) => {
    let classification;
    switch (activityLevel.toLowerCase()) {
      case 'sedentary': classification = "Sedentary (little or no exercise)"; break;
      case 'lightly active': classification = "Lightly Active (light exercise/sports 1-3 days/week)"; break;
      case 'moderately active': classification = "Moderately Active (moderate exercise/sports 3-5 days/week)"; break;
      case 'very active': classification = "Very Active (hard exercise/sports 6-7 days a week)"; break;
      case 'super active': classification = "Super Active (very hard exercise/sports & a physical job)"; break;
      default: classification = "Unknown Activity Level";
    }
    const newActivityClassification = new ActivityClassification({ activityLevel, classification });
    newActivityClassification.save();
    return newActivityClassification;
  },
  getHealthMetrics: async () => await HealthMetrics.find(),
  getMacronutrients: async () => await Macronutrients.find(),
  getIdealWeights: async () => await IdealWeight.find(),
  getActivityClassifications: async () => await ActivityClassification.find(),
  createHealthMetrics: async ({ age, weight, height, gender, activityLevel }) => {
    const bmi = weight / ((height / 100) ** 2);
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    let activityMultiplier;
    switch (activityLevel.toLowerCase()) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'lightly active': activityMultiplier = 1.375; break;
      case 'moderately active': activityMultiplier = 1.55; break;
      case 'very active': activityMultiplier = 1.725; break;
      case 'super active': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.2;
    }
    const tdee = bmr * activityMultiplier;
    const newHealthMetrics = new HealthMetrics({ age, weight, height, gender, activityLevel, bmi, bmr, tdee });
    await newHealthMetrics.save();
    return newHealthMetrics;
  },
  createMacronutrients: async ({ tdee, protein, carbs, fats }) => {
    const newMacronutrients = new Macronutrients({ tdee, protein, carbs, fats });
    await newMacronutrients.save();
    return newMacronutrients;
  },
  createIdealWeight: async ({ height, gender, minWeight, maxWeight }) => {
    const newIdealWeight = new IdealWeight({ height, gender, minWeight, maxWeight });
    await newIdealWeight.save();
    return newIdealWeight;
  },
  createActivityClassification: async ({ activityLevel, classification }) => {
    const newActivityClassification = new ActivityClassification({ activityLevel, classification });
    await newActivityClassification.save();
    return newActivityClassification;
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
