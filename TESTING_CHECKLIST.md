# ✅ BYOK System Testing Checklist

Use this checklist to verify everything works correctly.

---

## 🚀 Pre-Testing Setup

### 1. Start Services
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] MongoDB connected and running
- [ ] No console errors on startup

### 2. Environment Check
- [ ] `.env` file has `OPENROUTER_API_KEY`
- [ ] MongoDB connection string is correct
- [ ] All dependencies installed (`npm install`)

---

## 👤 User Registration & Login

### New User Flow
- [ ] Can create new account
- [ ] User saved to MongoDB
- [ ] Redirected to patient portal
- [ ] No errors in console

### Existing User Flow
- [ ] Can log in with existing account
- [ ] Redirected to patient portal
- [ ] User data loads correctly

---

## 💬 Message Counter Tests

### Initial State
- [ ] Chat button visible (bottom right)
- [ ] Click opens chat drawer
- [ ] Chat header shows message counter
- [ ] Counter displays: `20/20 free messages`
- [ ] Settings button (⚙️) visible
- [ ] Counter has blue/teal styling

### Sending Messages
- [ ] Send 1st message → Counter shows `19/20`
- [ ] Send 2nd message → Counter shows `18/20`
- [ ] Send 3rd message → Counter shows `17/20`
- [ ] Counter updates immediately after each message
- [ ] AI responds to each message

### Warning State
- [ ] Send messages until `5/20` remaining
- [ ] Counter turns yellow
- [ ] Counter has pulse animation
- [ ] Warning icon appears
- [ ] Still functional

### Limit Reached
- [ ] Send messages until `0/20`
- [ ] Try to send 21st message
- [ ] Upgrade modal appears automatically
- [ ] Modal has two options:
  - [ ] "Wait Until Tomorrow"
  - [ ] "Add Your API Key"
- [ ] Modal has professional design
- [ ] Modal has animations

---

## 🎯 Upgrade Modal Tests

### Modal Appearance
- [ ] Modal appears when limit reached
- [ ] Modal has overlay (darkened background)
- [ ] Modal is centered on screen
- [ ] Modal has close button (X)
- [ ] Click overlay closes modal
- [ ] Click X closes modal

### Modal Content
- [ ] Shows "Daily Limit Reached" message
- [ ] Shows current limit (20 messages)
- [ ] Explains two options clearly
- [ ] Has "How it works" section
- [ ] Has trust indicators
- [ ] Professional design

### Modal Actions
- [ ] Click "Wait Until Tomorrow" → Modal closes
- [ ] Click "Add Your API Key" → Settings modal opens
- [ ] Upgrade modal closes when settings opens
- [ ] Smooth transition between modals

---

## ⚙️ Settings Modal Tests

### Opening Settings
- [ ] Click settings button (⚙️) in chat header
- [ ] Settings modal opens
- [ ] Modal has overlay
- [ ] Modal is centered
- [ ] Modal has close button
- [ ] Click overlay closes modal
- [ ] Click X closes modal

### Settings Content
- [ ] Shows current status card
- [ ] Status shows "Free Plan" initially
- [ ] Shows "20 messages per day"
- [ ] Has OpenRouter instructions
- [ ] Instructions are clear and numbered
- [ ] Has API key input field
- [ ] Input field is password type (shows dots)
- [ ] Has show/hide button (👁️)
- [ ] Has "Save API Key" button
- [ ] Has FAQ section

### API Key Input
- [ ] Can type in input field
- [ ] Input shows dots (••••) by default
- [ ] Click eye icon → Shows actual key
- [ ] Click eye icon again → Hides key
- [ ] Input accepts long strings
- [ ] Input validates format

---

## 🔑 API Key Management Tests

### Getting OpenRouter Key
- [ ] Visit https://openrouter.ai
- [ ] Can create account
- [ ] Receives $5 free credits
- [ ] Can copy API key
- [ ] Key starts with `sk-or-v1-`

### Saving API Key
- [ ] Paste key in input field
- [ ] Click "Save API Key"
- [ ] Shows loading state
- [ ] Success message appears
- [ ] Status card updates to "Unlimited Plan"
- [ ] Modal can be closed
- [ ] No errors in console

### After Saving Key
- [ ] Chat header updates
- [ ] Counter changes to "∞ Unlimited" badge
- [ ] Badge is green
- [ ] Badge has infinity icon
- [ ] Settings button still visible

### Sending Messages with Key
- [ ] Can send unlimited messages
- [ ] No counter decrease
- [ ] No limit warnings
- [ ] No upgrade modal
- [ ] AI responds normally
- [ ] Send 50+ messages to verify

---

## 🔄 Daily Reset Tests

### Manual Reset Test
- [ ] In MongoDB, set `dailyMessageCount` to 20
- [ ] Set `lastResetDate` to yesterday
- [ ] Restart backend
- [ ] Check if count reset to 0
- [ ] Check if date updated to today

### Automatic Reset Test
- [ ] Wait until midnight (or change system time)
- [ ] Verify cron job runs
- [ ] Check backend logs
- [ ] Verify counts reset for free users
- [ ] Verify premium users unaffected

---

## 📱 Responsive Design Tests

### Desktop (1920px)
- [ ] Chat drawer opens smoothly
- [ ] Message counter visible
- [ ] Settings button visible
- [ ] Modals centered
- [ ] All text readable
- [ ] No layout issues

### Laptop (1366px)
- [ ] All elements visible
- [ ] Counter not cut off
- [ ] Modals fit on screen
- [ ] No horizontal scroll

### Tablet (768px)
- [ ] Chat drawer full width
- [ ] Counter wraps if needed
- [ ] Buttons still clickable
- [ ] Modals responsive
- [ ] Text still readable

### Mobile (375px)
- [ ] Chat drawer full screen
- [ ] Counter shows abbreviated text
- [ ] Settings button accessible
- [ ] Modals full width
- [ ] Touch targets large enough

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Stop backend
- [ ] Try to send message
- [ ] Error message appears
- [ ] Message explains issue
- [ ] No app crash

### Invalid API Key
- [ ] Enter invalid key format
- [ ] Try to save
- [ ] Error message appears
- [ ] Key not saved
- [ ] Can try again

### MongoDB Errors
- [ ] Disconnect MongoDB
- [ ] Try to save API key
- [ ] Error handled gracefully
- [ ] User sees error message
- [ ] App doesn't crash

### OpenRouter Errors
- [ ] Use invalid OpenRouter key
- [ ] Try to send message
- [ ] Error message appears
- [ ] Explains the issue
- [ ] Suggests solution

---

## 🔒 Security Tests

### API Key Storage
- [ ] Check MongoDB
- [ ] API key is encrypted
- [ ] Not readable in database
- [ ] `hasApiKey` field is boolean
- [ ] No plain text keys

### Frontend Security
- [ ] API key never in localStorage
- [ ] API key never in console logs
- [ ] API key never in network tab (except POST)
- [ ] Password input type used
- [ ] HTTPS in production

### Backend Security
- [ ] API key validated before saving
- [ ] API key encrypted before storage
- [ ] API key decrypted only when needed
- [ ] No keys in logs
- [ ] Environment variables used

---

## 🎨 UI/UX Tests

### Animations
- [ ] Counter updates smoothly
- [ ] Warning pulse animation works
- [ ] Modal fade-in animation
- [ ] Modal slide-up animation
- [ ] Button hover effects
- [ ] Settings button rotation on hover

### Visual Design
- [ ] Colors match theme
- [ ] Icons display correctly
- [ ] Fonts readable
- [ ] Spacing consistent
- [ ] Borders and shadows correct
- [ ] Professional appearance

### User Experience
- [ ] Clear call-to-actions
- [ ] Helpful error messages
- [ ] Loading states visible
- [ ] Success feedback clear
- [ ] Easy to understand
- [ ] Intuitive flow

---

## 📊 Backend API Tests

### GET /api/api-key/status/:userId
- [ ] Returns correct status
- [ ] Shows remaining messages
- [ ] Shows daily limit
- [ ] Shows hasApiKey boolean
- [ ] Returns 200 status

### POST /api/api-key/save
- [ ] Accepts userId and apiKey
- [ ] Validates input
- [ ] Saves to MongoDB
- [ ] Returns success message
- [ ] Returns 200 status

### POST /api/chat/message
- [ ] Accepts patientId, content, userId
- [ ] Checks message limit
- [ ] Uses correct API key
- [ ] Returns AI response
- [ ] Returns remaining count
- [ ] Returns 429 when limit reached

---

## 🧪 Edge Cases

### Multiple Users
- [ ] User A has 5 messages left
- [ ] User B has 20 messages left
- [ ] Both can send independently
- [ ] Counts don't interfere
- [ ] Each has own limit

### Rapid Messages
- [ ] Send 5 messages quickly
- [ ] All messages processed
- [ ] Counter updates correctly
- [ ] No race conditions
- [ ] No duplicate messages

### Long Messages
- [ ] Send very long message (1000+ chars)
- [ ] Message sends successfully
- [ ] Counter updates
- [ ] AI responds
- [ ] No truncation issues

### Special Characters
- [ ] Send message with emojis 😀
- [ ] Send message with symbols !@#$%
- [ ] Send message with newlines
- [ ] All handled correctly
- [ ] No encoding issues

---

## 🎯 Integration Tests

### Complete User Journey
- [ ] Sign up as new user
- [ ] Open chat
- [ ] See 20/20 counter
- [ ] Send 20 messages
- [ ] See upgrade modal
- [ ] Click "Add API Key"
- [ ] See settings modal
- [ ] Get OpenRouter key
- [ ] Save API key
- [ ] See unlimited badge
- [ ] Send unlimited messages
- [ ] Everything works smoothly

### Returning User Journey
- [ ] Log in as existing user
- [ ] Open chat
- [ ] See correct counter (based on usage)
- [ ] Send messages
- [ ] Counter updates
- [ ] Everything persists

### Premium User Journey
- [ ] Log in as user with API key
- [ ] Open chat
- [ ] See unlimited badge
- [ ] Send messages
- [ ] No limits
- [ ] Can access settings
- [ ] Can update API key

---

## 📝 Final Checks

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code formatted properly

### Documentation
- [ ] README updated
- [ ] API documented
- [ ] Components documented
- [ ] Setup instructions clear
- [ ] Troubleshooting guide available

### Performance
- [ ] Chat opens quickly
- [ ] Messages send fast
- [ ] Modals open smoothly
- [ ] No lag or stuttering
- [ ] Animations smooth

### Accessibility
- [ ] Buttons have titles
- [ ] Icons have labels
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient

---

## ✅ Sign-Off

### Developer Checklist
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

### Deployment Checklist
- [ ] Environment variables set
- [ ] MongoDB configured
- [ ] HTTPS enabled
- [ ] Error logging setup
- [ ] Monitoring configured

---

## 🎉 Success Criteria

All items checked? **Congratulations!** 🎊

Your BYOK system is:
✅ Fully functional
✅ Well tested
✅ Production ready
✅ User friendly
✅ Secure

**Time to deploy!** 🚀

---

## 📞 If Tests Fail

1. Check browser console for errors
2. Check backend logs
3. Verify MongoDB connection
4. Review `BYOK_INTEGRATION_COMPLETE.md`
5. Check `TROUBLESHOOTING` section
6. Test with Postman
7. Verify environment variables

---

*Last Updated: Now*
*Status: Ready for Testing*
*Version: 1.0.0*
