import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
  },
  { timestamps: true }
);

const File = mongoose.models.File || mongoose.model("File", fileSchema);

export default File;
