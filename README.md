# 🎓 Student Invest Hub - Full-Stack Earning & Investment Platform

A complete, production-grade full-stack web application designed for student investments, daily returns, 50% referral commissions, manual EasyPaisa / JazzCash slip verification, and a comprehensive Admin Control Panel.

---

## 🌟 Key Features

1. **Student Investment Plans**:
   - **Bronze Starter**: Rs. 1,000 | Rs. 100 Daily Bonus | 30 Days | Rs. 500 (50%) Referral Bonus
   - **Silver Scholar**: Rs. 2,500 | Rs. 275 Daily Bonus | 30 Days | Rs. 1,250 (50%) Referral Bonus
   - **Gold Campus Pro**: Rs. 5,000 | Rs. 600 Daily Bonus | 30 Days | Rs. 2,500 (50%) Referral Bonus
   - **Diamond Graduate Elite**: Rs. 10,000 | Rs. 1,400 Daily Bonus | 30 Days | Rs. 5,000 (50%) Referral Bonus

2. **Daily Profit Claim System**:
   - Students click "Claim Daily Profit" once every 24 hours to credit their daily ROI directly into their wallet.

3. **50% Instant Referral Commission**:
   - Every student receives a unique referral link (`/register?ref=CODE`).
   - When an invited friend buys a plan (e.g. Bronze 1,000 PKR), the inviter instantly receives **Rs. 500 (50%)** in their wallet.

4. **Withdrawal System & Mandatory 2-Invite Rule**:
   - Minimum withdrawal: **Rs. 800**.
   - Students must have invited at least **2 registered students** before they can request a withdrawal.
   - Payouts via EasyPaisa and JazzCash.

5. **EasyPaisa & JazzCash Manual Deposit Flow**:
   - Dynamic receiver account numbers & titles.
   - Student submits: Amount, Sender Account Number, Sender Name, Transaction ID (TID), and uploads payment screenshot/slip.
   - Admin verifies slip and with 1-click **Approve**, the funds are automatically credited to the student's balance.

6. **Super Admin Control Panel**:
   - Overview KPIs (Total Users, Total Deposited, Total Withdrawn, Pending Slips, Active Plans).
   - Deposit Manager with high-res slip screenshot lightbox.
   - Withdrawal Manager with 1-click "Mark as Paid".
   - Student Manager with direct wallet balance adjustments.
   - Dynamic Gateway Settings (Update EasyPaisa / JazzCash numbers, Min Withdrawal, WhatsApp helpline, Notice ticker).
   - In-app Support Ticket Center.

7. **Mobile & iPhone Responsive (iOS Touch UI)**:
   - Native bottom navigation bar for iPhones & Android screens.
   - Glassmorphism dark-mode fintech theme.

---

## 🚀 How to Run the Project

### 1. Start Backend Server (Port 5000)
```bash
cd "C:\Users\Administrator\Desktop\earning project\backend"
npm start
```
Backend API will be live at: `http://localhost:5000`

### 2. Start Frontend Server (Port 5173)
```bash
cd "C:\Users\Administrator\Desktop\earning project\frontend"
npm run dev
```
Frontend App will be live at: `http://localhost:5173`

---

## 🔑 Default Login Credentials

### 👑 Super Admin Account:
- **Phone / Email**: `03000000000`
- **Password**: `admin123`
- **Role**: `ADMIN` (Full Admin Control Panel Access)

### 🎓 Demo Student Account:
- **Phone / Email**: `03123456789`
- **Password**: `student123`
- **Role**: `USER`
- **Referral Code**: `HAMZA99`
