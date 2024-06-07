
const Story = require('../models/storiesModel');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
//const storiesModel = require('../models/SubStories');
const jwt = require("jsonwebtoken");
const SubStories = require('../models/SubStories');
const { title } = require('process');
const multer = require('multer');
const { messaging } = require('firebase-admin');
const { text } = require('body-parser');


const createStory = async (req, res) => {
    try {
        const { publishedby } = req.body;
        const newStory = await Story.create({ publishedby });
        res.status(201).json({
            success: true,
            data: newStory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/substories/uploads');
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.split(' ').join('-');
      const ext = file.mimetype.split('/')[1];
      cb(null, `${Date.now()}-${fileName}`);
    },
  });
  
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image') ){
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Not an image or video! Please upload only images or videos',
          400
        ),
        false
      );
    }
  };
  
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });
  
  exports.uploadStoryMedia = upload.single('chooseFile');

  const createStoryWithSubStories = async (req, res) => {
    try {
      const { story, text, description } = req.body;
  
      let mediaType = null;
      if (req.file) {
        if (req.file.mimetype.startsWith('image'))
          mediaType = 'Image';
      }
  
      const subStoryData = {
        story,
        text,
        description,
      };
      if(req.file){
        subStoryData.chooseFile = `public/uploads/${req.file.filename}`;
      }
      //image: req.file ? `public/substories/uploads/${req.file.filename}` : null,
  
      const newSubStory = await SubStories.create(subStoryData);
  
      res.status(201).json({
        success: true,
        data: [newSubStory],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  



const getAllStories = catchAsync(async (req, res) => {
    try {
        const stories = await Story.find().populate('__stories').lean();
        res.status(200).json({
            success: true,
            data: stories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const deleteStory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStory = await Story.findByIdAndDelete(id);
        if (!deletedStory) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.status(200).json({ message: 'Story deleted successfully', data: deletedStory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, description } = req.body;
    let updatedData = {};
    console.log("BODY",  req.body.description)
    if (text !== undefined) {
      updatedData.text = text;
    }
    if (description !== undefined) {
      updatedData.description = description;
    }
    if (req.file) {
      updatedData.chooseFile = `public/substories/uploads/${req.file.filename}`;
    }

    console.log('Updated data to be saved:', updatedData);
    const updatedSubStory = await SubStories.findByIdAndUpdate(id, updatedData, { new: true });
    
    if (!updatedSubStory) {
      return res.status(404).json({ message: 'Substory not found' });
    }

    res.status(200).json({ message: 'Substory updated', data: updatedSubStory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStoryById = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.status(200).json({ data: story });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const HitLike = catchAsync(async (req, res, next) => {
    const StoryId = req.params.id;
    const story = await Story.findById(StoryId);
    
    if (!story) {
      return next(new AppError('No ad found with that ID', 404));
    }
  
    story.likecounts++;
    await story.save();
  
    res.status(200).json({
      status: 'success',
      message: 'Likes count incremented successfully',
      story,
    });
  });



  const HitShare = catchAsync(async (req, res, next) => {
    const StoryId = req.params.id;
    const story = await Story.findById(StoryId);
    
    if (!story) {
      return next(new AppError('No Story found with that ID', 404));
    }
  
    story.shareCount++; 
    await story.save();

    
  
    res.status(200).json({
      status: 'success',
      message: 'Share count incremented successfully',
      story,
    });
});



module.exports = {
    getAllStories,
    deleteStory,
    updateStory,
    getStoryById,
    HitLike,
    HitShare,
    createStoryWithSubStories,
    createStory
};
