const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const { find } = require('../../models/Profile');

// @route	GET api/profile/me
// @desc	Get current user profile
// @access	public

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    req.status(500).send('Server error');
  }
});
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'skilss is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    // destructure the request
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
      console.log('____________________log :' + company);
      profileFields.company = company;
    }
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    // console.log(profileFields.skills);
    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };
    // add socialFields to profileFields
    profileFields.social = socialFields;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      //update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // Create profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    Get api/profile
// @desc     get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', [
      'name',
      'avatar',
      'email',
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    Get api/profile/user/:user_id
// @desc     get profile by user id
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar', 'email']);
    if (!profile) return res.status(400).send('Profile not found');
    res.json(profile);
  } catch (err) {
    if (err.kind == 'ObjectId')
      return res.status(400).send('Profile not found');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    Delete api/profile
// @desc     delete profile by token
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    //@todo Remove user's posts
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'user deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/experience
// @desc     Create or update user profile.experience / update not working !
// @access   Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty(),
      check('location', 'location is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('______ERROR');
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const { title, company, location, from, to, current, description } =
      req.body;

    //Build experience object
    const exp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // if experience exists, update experience
      if (profile.experience.length > 0) {
        profile.experience.unshift(exp);
        await profile.save();
        res.json(profile);
      }
      // if experience does not exist, create experience
      else {
        profile.experience.unshift(exp);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    Delete api/profile/experience/:exp_id
// @desc     delete profile by exp_id
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    //find profile by user id
    const profile = await Profile.findOne({ user: req.user.id });
    //check if experience exists
    if (!profile) return res.status(400).send('Profile not found');
    if (profile.experience.length > 0) {
      //remove experience from profile
      profile.experience.remove(req.params.exp_id);
      await profile.save();
    }
    else {
      return res.status(400).send('Experience not found');
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/education
// @desc     Create or update user profile.education / update not working !
// @access   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('fieldofstudy', 'field of study is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    //Build education object
    const edc = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // if education exists, update education
      if (profile.education.length > 0) {
        profile.education.unshift(edc);
        await profile.save();
        res.json(profile);
      }
      // if education does not exist, create education
      else {
        profile.education.unshift(edc);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    Delete api/profile/education/:edc_id
// @desc     delete profile by exp_id
// @access   Private
router.delete('/education/:edc_id', auth, async (req, res) => {
  try {
    //find profile by user id
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).send('Profile not found');
    //check if education exists
    if (profile.education.length > 0) {
      //remove education from profile
      profile.education.remove(req.params.edc_id);
      await profile.save();
    } else {
      return res.status(400).send('Education not found');
    }
    res.json(profile);
  } catch (err) {
    // check if error is kind of ObjectId
    console.log('___<' + err + '>');
    if (err.kind == 'ObjectId')
      return res.status(400).send('Profile not found');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
