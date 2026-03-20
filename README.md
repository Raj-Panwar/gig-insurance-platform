## GUIDWIRE
## **1. Problem Definition**

Gig economy delivery partners in India working with platforms like Swiggy, Zomato, Amazon, and Zepto rely heavily on daily work for income. However, their earnings are vulnerable to external disruptions such as heavy rain, extreme heat, pollution spikes, floods, or sudden curfews, which can slow or stop deliveries and reduce weekly earnings by around 20–30%. Currently, traditional insurance covers health, accidents, or vehicle damage but does not protect workers from temporary income loss caused by such external conditions. To address this gap, we propose an **AI-powered parametric insurance platform** that automatically compensates gig workers when predefined disruption events occur.
<img width="864" height="576" alt="image" src="https://github.com/user-attachments/assets/ea67d625-3a4b-4231-ad8d-007b6e061011" />


## **2. Target Persona**

### **Persona Focus: Food Delivery Partner** 

We focus on food delivery partners working on platforms like Swiggy or Zomato. 

### **Worker Profile (Sample)**

Name: Ravi Kumar 

Age: 27 

City: Delhi 

Vehicle: Motorcycle 

Device: Budget Android smartphone 

### **Work Pattern** 

-   Works 8–10 hours daily 
-   Completes 20–25 deliveries per day 
-   Earns ₹700–₹900 per day 
-   Weekly earnings ≈ ₹4500–₹6000 

### **Major Disruptions (Food Delivery Partners)** 

Food delivery partners on platforms like Swiggy and Zomato depend on consistent orders and safe travel conditions. However, several external disruptions can reduce their ability to work and cause income loss. 

### **Common disruptions include:** 

**-   Heavy rain** – reduces deliveries and makes roads unsafe 
**-   Flooded roads / waterlogging** – prevents access to delivery areas 
**-   Extreme heat** – limits safe outdoor working hours 
**-   Severe pollution (high AQI)** – discourages outdoor work 
**-   Local curfews or protests** – restrict movement in certain zones 

These disruptions reduce order availability and prevent safe travel, leading to loss of earnings for delivery workers. 

## **3. Existing Scenario  - Without Insurance**

Ravi plans to work the entire week and expects to earn ₹5000. 

On Wednesday, heavy rainfall hits Delhi for several hours. 

Due to flooded roads and low order demand: 

-   Ravi completes only 5 deliveries 
-   Earns only ₹200 that day 
-   Loses around ₹500 in expected income 

This loss directly affects his weekly earnings and, in turn, his livelihood.

## **4. Proposed solution**

This project proposes an AI-powered parametric income protection platform for gig delivery workers.

**Key Features**  

**• Weekly income protection plans** aligned with gig workers’ earning cycles

**• AI-based pricing** using historical disruption and location risk data

**• Automated disruption monitoring** via weather, pollution, and event APIs

**• Parametric triggers** that automatically activate payouts when thresholds (e.g., heavy rain or high AQI) are crossed

**• Automatic claim processing** with no manual filing required

**• Fraud detection** using location and activity validation

**• Real-time notifications** for disruptions and payouts

**• Analytics dashboard** showing coverage, claims, and protected earnings

The platform follows a parametric ins

### **future scenario (with insurance)**

Before starting the week, Ravi purchases weekly income protection coverage. 

-   The mobile app continuously polls a Weather API to monitor rainfall intensity in Ravi’s delivery zone.
-   When rainfall exceeds the predefined threshold, the system detects that Ravi’s working zone is affected.
-   The mobile app triggers the parametric event.
-   The event details are sent to the backend database server.
-   A stored procedure in the database automatically generates a claim.
-   The system calculates the compensation amount using the parametric pricing model.
-   A ₹350 payout is credited directly to Ravi’s wallet.

## **5. Weekly Pricing Model**
<img width="1287" height="848" alt="image" src="https://github.com/user-attachments/assets/1da21ec7-0c4c-43a7-a60f-51ff16d18228" />

The pricing model is structured around weekly income protection, since gig workers receive weekly payouts. 

### **Step 1: Estimate Weekly Income** 

Average weekly income = ₹5000 

### **Step 2: Select Coverage Percentage** 

Coverage chosen = 30% 

Maximum payout: 

₹5000 × 30% = ₹1500 

### **Step 3: Estimate Disruption Probability** 

Based on historical weather data in the city: 

Expected disruptions per week = 1 event 

Average loss per event ≈ ₹400 

Expected weekly payout risk ≈ ₹400 

### **Step 4: Premium Calculation** 

Premium formula: 

Premium = Expected payout risk + platform margin 

Example: 

Expected risk = ₹400 

Operational margin = ₹60 

Weekly premium = ₹460 / 10 = ₹46 

Final premium ≈ ₹40–₹50 per week 

This keeps the insurance affordable for gig workers. 

## **6. Parametric Trigger System**

Parametric triggers are predefined external conditions that automatically activate insurance claims. Unlike traditional insurance systems that rely on static, fixed thresholds, our platform uses an AI-driven parametric model where trigger conditions are dynamically adjusted using real-time and historical data. The system frequently recalibrates disruption thresholds based on city conditions, seasonal patterns, and delivery activity to accurately detect when gig workers are unable to work. 

### **Environmental Triggers** 

-   Heavy rainfall exceeding safe delivery conditions 
-   Extreme heat affecting outdoor work safety 
-   Flood alerts issued by local authorities 

### **Pollution Triggers** 

-   AQI > 400 indicating severe air pollution 

### **Social & Infrastructure Triggers** 

-   Government curfews or lockdowns 
-   Local protests or strikes blocking delivery routes 
-   Transport shutdowns affecting delivery zones 

### **Trigger Workflow** 

1.  External APIs collect real-time environmental and city data. 
2.  The AI model dynamically evaluates disruption risk and adjusts thresholds. 
3.  If disruption conditions are detected, the system records the event. 
4.  Affected delivery zones are identified. 
5.  Claims are automatically triggered. 
6.  Payouts are calculated and processed instantly. 

## **7. AI / ML Components**

### **1. Risk Assessment Model** 

Machine learning predicts weekly disruption probability based on historical data. 

Inputs: 

-   Weather patterns 
-   Seasonal trends 
-   Pollution history 
-   Delivery zone data 

Output: 

-   Risk score for each worker zone 

Premium is adjusted dynamically. 

### **2. Disruption Prediction** 

The AI system predicts upcoming disruptions using: 

Weather forecasts 

Pollution trends 

Traffic congestion patterns 

Example: 

Model predicts 80% probability of heavy rainfall next week 

The system adjusts pricing accordingly. 

### **3. Fraud Detection** 

AI detects suspicious claims such as: 

-   GPS spoofing 
-   Multiple claims from same event 
-   Claim triggered when worker was offline 

Possible methods: 

Isolation Forest 

Anomaly Detection 

Rule-based validation 

## **8. Technology Stack**

### **Frontend** 

React Native mobile app 

Reason: 

-   Cross-platform support 
-   Lightweight UI 
-   Large developer ecosystem 

### **Backend** 

Flask (Python)

Reason:

• Lightweight and fast backend framework

• Easy to build REST APIs for mobile applications

• Strong integration with Python AI/ML libraries

• Flexible architecture for handling policy and claim services

• Simple integration with external APIs (weather, payments) 

### **Database** 

PostgreSQL 

Reason: 

-   Reliable relational database 
-   Handles structured insurance data 
-   Supports complex queries 

### **AI/ML** 

Python microservice 

Libraries: 

-   Scikit-learn 
-   Pandas 
-   NumPy 

## **9. API Integrations**

External APIs are used to detect disruption events and process automated payouts.

Weather API

Example: OpenWeather API

Used to monitor environmental disruptions such as rainfall, extreme heat, and storms that may prevent deliveries.

Air Quality API

Example: AQICN API

Used to track pollution levels and AQI spikes that may impact outdoor delivery operations.

Traffic API

Example: Google Maps Traffic API

Used to detect severe traffic congestion or road blockages affecting delivery routes.

Payment API

Example: Razorpay Sandbox

Used to simulate automated compensation payouts to the worker’s wallet.

## **10. Database Design**
<img width="1536" height="873" alt="image" src="https://github.com/user-attachments/assets/1a3ffd47-7c89-405f-bfb2-60a18d9885c3" />

The platform uses a PostgreSQL database to store and manage information related to delivery workers, insurance policies, disruption events, and claims. The schema is designed to support automated parametric insurance processing, where disruption data can trigger claims linked to active policies. This structure ensures efficient tracking of users, policies, detected disruptions, and corresponding payouts. 

## **11. UI Design** 
<img width="1210" height="829" alt="image" src="https://github.com/user-attachments/assets/ceef682e-616c-4122-8c1a-64b238591645" />


Key screens in the mobile application:
### **Onboarding Screen** 

-   Register using phone number 
-   Select city and delivery platform 

### **Policy Purchase Screen** 

-   Select weekly coverage 
-   Display premium 

### **Worker Dashboard** 

Shows: 

-   Active policy 
-   Weekly coverage 
-   Earnings protected 

### **Claim History Screen** 

Displays: 

-   Disruptions detected 
-   Past payouts 

### **Admin Dashboard** 

Shows analytics such as: 

-   Number of active policies 
-   Disruption frequency 
-   Claim statistics 

## **12. Low-End Mobile Optimization**

Here is a shorter, cleaner version suitable for a document draft:

### **Low-End Device Optimization**

Most delivery partners use budget Android phones with limited RAM, storage, and unstable internet connections. The mobile app is designed to run efficiently on such devices by focusing on lightweight performance.

Optimization strategies:

1.  Lightweight UI – simple interface to reduce device processing load.
2.  Minimal animations – improves responsiveness and reduces GPU usage.
3.  Compressed images/assets – lowers storage and speeds up loading.
4.  Lazy data loading – loads only required data to save memory.
5.  Offline caching – allows basic functionality even with poor internet.
6.  API compression – reduces network data usage.
7.  Efficient background services – limits background tasks to save battery.

These optimizations ensure smooth performance even on 2–3 GB RAM devices with low bandwidth connectivity, which are common among gig delivery workers.

## **13. Development Plan**
<img width="864" height="576" alt="image" src="https://github.com/user-attachments/assets/110d215e-432f-460d-9eee-d1ac098aea05" />

## **14. Platform Choice Justification**

### **Mobile App (for gig workers)** 

Food delivery partners spend most of their time outdoors and rely on smartphones to manage their work on platforms like Swiggy and Zomato. Many workers also have limited access to laptops and unstable internet connections, making mobile the most practical platform. 

A mobile-first approach ensures: 

-   Easy access directly from the worker’s phone 
-   Real-time disruption notifications 
-   Instant visibility of claims and payouts 
-   Simple policy management during work hours 

This allows workers to receive protection and compensation quickly and conveniently while continuing their deliveries. 

### **Why a Web Application (for insurers)** 

A web platform is used for insurers and administrators to manage the system. 

It enables: 

-   Policy and system management 
-   Monitoring disruption events and claims 
-   Analytics and fraud detection 
-   Administrative control and reporting 

This separation ensures a lightweight mobile experience for workers and a powerful management dashboard for administrators. 

 ## **Adversarial Defense & Anti-Spoofing Strategy**

### 1. Differentiating Genuine Workers from Spoofers

Our platform does not rely only on GPS, since it can be easily spoofed. Instead, the system validates claims using multiple signals such as worker movement patterns, delivery activity, and environmental conditions. Genuine workers usually show reduced movement and order activity during disruptions, while spoofers often show unrealistic or inconsistent behaviour.

### 2. Data Signals Used

The system analyses several data points to detect fraud:

-   Device and network signals
-   Delivery activity logs
-   Environmental disruption data (weather, AQI, curfews)
-   Activity patterns of nearby workers

Cross-checking these signals helps detect coordinated fraud attempts.

### 3. Fair Claim Handling

Claims follow a tiered verification process:

-   Auto-approve when signals match disruption events
-   Soft review for minor inconsistencies
-   Manual review only for high-risk cases

This ensures fast payouts for genuine workers while preventing fraudulent claims.
<img width="1254" height="832" alt="image" src="https://github.com/user-attachments/assets/6ac229ef-ef97-4c85-afb7-143f8a66bf90" />
