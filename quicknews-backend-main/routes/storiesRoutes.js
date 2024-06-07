const express = require('express');
const router = express.Router();
const storiesController = require('../controllers/storiesController');
const multer = require('multer')


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads');
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

uploadStoryMedia = upload.single('chooseFile');

router.get('/getstories', storiesController.getAllStories);
router.put('/like-story/:id', storiesController.HitLike);
router.put('/share-story/:id', storiesController.HitShare);
router.post('/create-story',uploadStoryMedia, storiesController.createStoryWithSubStories);
router.post('/create',storiesController.createStory);
router.get('/:id',storiesController.getStoryById );
router.put('/:id', storiesController.updateStory);
router.delete('/:id', storiesController.deleteStory);

module.exports = router;