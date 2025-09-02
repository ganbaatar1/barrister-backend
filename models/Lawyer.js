const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  lastName: {
    type: String,
    required: [true, "Овог заавал шаардлагатай"],
  },
  firstName: {
    type: String,
    required: [true, "Нэр заавал шаардлагатай"],
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  specialization: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  academicDegree: {
    type: String,
    required: [true, "Боловсролын зэрэг шаардлагатай"],
  },
  experience: {
    type: String,
    required: [true, "Туршлагын мэдээлэл шаардлагатай"],
  },
  startDate: {
    type: Date,
    required: [true, "Ажил эхэлсэн огноо шаардлагатай"],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: "Ирээдүйн огноо байж болохгүй",
    },
  },
  status: {
    type: String,
    enum: ['ажиллаж байгаа', 'амарч байгаа', 'ажлаас гарсан'],
    default: 'ажиллаж байгаа',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lawyer', lawyerSchema);
