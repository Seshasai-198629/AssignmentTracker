# 📚 College Assignment Tracker

A web-based assignment and assessment tracker for college students, with cloud sync across all your devices using Firebase.

## ✨ Features

- **📝 Assignment Tracking**: Track homework, projects, essays, labs, and more
- **📊 Assessment Management**: Keep track of exams with topics covered
- **🎨 Color-Coded Status**: 
  - 🟢 Green = Completed
  - 🟡 Yellow = In Progress
  - 🔴 Red = Not Started
- **📅 Weekly Organization**: Automatically groups items by week and sorts by due date
- **🔐 Secure Authentication**: Email/password login with Firebase
- **☁️ Cloud Sync**: Access your data from any device, anywhere
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Getting Started

### Option 1: Local Use Only (No Setup Required)
If you don't need cross-device sync, you can use the local version:
1. Open `login.html` in your browser
2. Create an account and start tracking!

### Option 2: Cloud Sync Across Devices (Requires Firebase Setup)

**Follow these steps:**

1. **Complete Firebase Setup** (5-10 minutes)
   - Read the detailed guide: `FIREBASE_SETUP.md`
   - Create a free Firebase account
   - Set up Authentication and Realtime Database
   - Get your configuration values

2. **Configure the App**
   - Open `firebase-config.js`
   - Replace the placeholder values with your Firebase configuration

3. **Start Using**
   - Open `login.html` in your browser
   - Create an account with your email
   - Start tracking assignments and assessments!

4. **Access from Other Devices**
   - Open the same files on any device
   - Login with the same email/password
   - All your data will be synced automatically!

## 📁 Files

- `login.html` - Login and signup page (start here!)
- `index.html` - Assignments page
- `assessments.html` - Assessments page
- `styles.css` - All styling
- `script.js` - Main application logic
- `auth.js` - Authentication handling
- `firebase-config.js` - Firebase configuration (you need to edit this!)
- `FIREBASE_SETUP.md` - Detailed Firebase setup instructions

## 🔧 How to Use

### Adding a Class
1. Click "Add Class" button
2. Enter class name, start date, and end date
3. All assignments/assessments will be linked to classes

### Adding an Assignment
1. Click "Add Assignment" button
2. Select the class
3. Enter assignment details (name, type, due date, status)
4. View it organized by week!

### Adding an Assessment
1. Go to the Assessments page
2. Click "Add Assessment" button
3. Select the class
4. Enter assessment details (name, date, topics, status)

### Updating Status
- Delete and recreate items to change their status
- Status determines the color coding

## 🔒 Security

- Your password is securely handled by Firebase Authentication
- Data is stored per-user - no one else can see your assignments
- Update security rules in Firebase after testing (see FIREBASE_SETUP.md)

## 💡 Tips

- Add all your classes first for easier assignment creation
- Use descriptive names for assignments and assessments
- Update status regularly to track progress
- Check the assessments page to prepare for upcoming tests

## 🐛 Troubleshooting

**"Firebase configuration error"**
- Make sure you've updated `firebase-config.js` with your actual Firebase values
- Follow the setup guide in `FIREBASE_SETUP.md`

**Can't login**
- Verify Firebase Authentication is enabled for Email/Password
- Check that you're using the correct email and password

**Data not syncing**
- Ensure you're logged in with the same account on all devices
- Check that Realtime Database is enabled in Firebase
- Verify you have internet connection

## 📝 Future Enhancements

Potential features to add:
- Edit assignments/assessments in place
- Grade tracking
- GPA calculator
- Export to calendar
- Email reminders
- Dark mode
- File attachments

## 🎓 Perfect for College Students!

Stay organized, never miss a deadline, and access your assignments from anywhere - your laptop, phone, library computer, or tablet. All synced seamlessly!

---

Made with ❤️ for college students who want to stay organized!
