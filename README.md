<div align="center">

# Projects Service

<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
  />
</a>

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring?filename=src%2Fpackage.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>

</br>
The Project building block facilitates the creation and engagement with micro-improvement projects.

---

## 💻 Supported Operating Systems

- **Ubuntu** (Recommended: Version 20 and above)  
- **Windows** (Recommended: Version 11 and above)  
- **macOS** (Recommended: Version 12 and above)  

---

## ✨ Setup & Deployment Guide

This section outlines the different ways to set up the **Projects Service**. Please select the deployment environment and setup method that best suits your needs.

---

<details>
<summary> 🚀 <b>STAND-ALONE SETUP (Stand Alone Setup)</b> </summary>
<br>

This setup is ideal for **local development and testing** where only the core Projects Service components are required.  

In the **Stand-Alone Setup**, the **Samiksha service is not included**. Only the following flows will be available:  
- **Programs**  
- **Projects**  
- **Reports**

#### I. Docker Setup (Recommended)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/setup/docker/stand-alone/ubuntu/README.md)  
- [Setup guide for macOS](link/to/standalone/docker/macos/README)  
- [Setup guide for Windows](link/to/standalone/docker/windows/README)  

<br>

#### II. Native Setup (PM2 Managed Services)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/setup/native/stand-alone/ubuntu/README.md)  
- [Setup guide for macOS](link/to/standalone/native/macos/README)  
- [Setup guide for Windows](link/to/standalone/native/windows/README)  

</details>

---

<details>
<summary> 🚀 <b>WITH SAMIKSHA SERVICE (Integrated Setup)</b> </summary>
<br>

This setup integrates the Projects Service with the **Samiksha Service**, providing a full-featured, production-ready deployment environment. The following flows will be available:  
- **Programs**  
- **Projects**  
- **Survey**  
- **Observation**  
- **Reports**

#### I. Docker Setup (Recommended)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuideWithSurvey/documentation/3.4.0/setup/docker/project-with-survey/ubuntu/README.md)  
- [Setup guide for macOS](link/to/samiksha/docker/macos/README)  
- [Setup guide for Windows](link/to/samiksha/docker/windows/README)  

<br>

#### II. Native Setup (PM2 Managed Services)

- [Setup guide for Linux](https://github.com/ELEVATE-Project/project-service/blob/setupGuideWithSurvey/documentation/3.4.0/setup/native/project-with-survey/ubuntu/README.md)  
- [Setup guide for macOS](link/to/samiksha/native/macos/README)  
- [Setup guide for Windows](link/to/samiksha/native/windows/README) 

</details>
<br>

## 📖 Related Documentation & Tools


### 🗂️ Database Architecture Diagrams

Explore the database schemas for the ELEVATE-Project services below.  
Click on a service name to expand and view the diagram.

<br>

<details>
<summary>📂 <b>Entity Management Service (EMS)</b></summary>
<br>
<p align="center">
  <img src="https://github.com/ELEVATE-Project/project-service/raw/MainReadMe/documentation/3.4.0/database-diagram/EMS-Entity-Service.drawio.png" alt="Entity Management Diagram" width="100%">
</p>
</details>

<details>
<summary>📂 <b>Project Service</b></summary>
<br>
<p align="center">
  <img src="https://github.com/ELEVATE-Project/project-service/raw/MainReadMe/documentation/3.4.0/database-diagram/EMS-Project-Service.drawio.png" alt="Project Service Diagram" width="100%">
</p>
</details>

<details>
<summary>📂 <b>Samiksha Service (Survey & Observation)</b></summary>
<br>
<p align="center">
  <img src="https://github.com/ELEVATE-Project/project-service/raw/MainReadMe/documentation/3.4.0/database-diagram/EMS-Samiksha-Service.drawio.png" alt="Samiksha Service Diagram" width="100%">
</p>
</details>

> **Tip:** If the diagrams appear too small, you can right-click the image and select  
> **"Open image in new tab"** to view the full-resolution architectural details.

---

### 🧪 Postman Collections and API DOC

- <a href="https://github.com/ELEVATE-Project/project-service/tree/main/api-doc" target="_blank">
  Projects Service API Collection
- <a href="https://github.com/ELEVATE-Project/samiksha-service/tree/main/api-doc" target="_blank">
  Samiksha Service API Collection
</a>

---

### 🛠️ Adding New Projects to the System

With SUP (Solution Upload Portal), you can seamlessly add new projects , survey and observation to the system.  
Once it's successfully added, it becomes visible on the portal, ready for use and interaction.

For a comprehensive guide on setting up and using the SUP, please refer to:

- <a href="https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script" target="_blank">
  solution-Upload-Portal-Service
- <a href="https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script" target="_blank">
  solution-Upload-Portal
</a>

---

### 🔖 Versioning & Documentation Links

This README is focused on the **3.4.0 Setup Guide** for the Projects Service.

- **Current Version (3.4.0) Documentation**  
  All setup links above point to the **3.4.0** guides.

- **Legacy Version (1.0.0) Documentation**  
  <a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/1.0.0/ReadMe.md" target="_blank">
    View 1.0.0 Documentation
  </a>

---
## 👥 Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

---

### Open Source Dependencies
This project uses several open-source tools and dependencies that supported its development

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)  
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)  
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)  
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)  
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)  
