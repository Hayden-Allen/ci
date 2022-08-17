const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
  console.log(process.env);
  await mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@test.1fkmuj4.mongodb.net/test`
  );

  const Schema = mongoose.Schema;

  const kittenSchema = new Schema({ name: String });
  kittenSchema.methods.speak = function speak() {
    console.log(this.name);
  };
  const Kitten = mongoose.model("Kitten", kittenSchema);

  const test = new Kitten({ name: "Test" });
  await test.save();

  return await Kitten.find();
}

export default async (req, res) => {
  try {
    const kittens = await main();
    res.status(200).send(kittens);
  } catch (err) {
    res.status(500).send(err);
  }
};
