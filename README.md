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

-   **Ubuntu** (Recommended: Version 20 and above)
-   **Windows** (Recommended: Version 11 and above)
-   **macOS** (Recommended: Version 12 and above)

---

## ✨ Setup & Deployment Guide

This section outlines the different ways to set up the **Projects Service**. Please select the deployment environment and setup method that best suits your needs.

### 🥇 **STAND-ALONE SETUP (Projects Service Only)**

<details>
<summary> **Click to Expand Stand-Alone Setup Options** </summary>
<br>

This setup is ideal for **local development, testing**, and deployments where only the core Projects Service components are required.

#### I. Docker Setup (Recommended)

<details>
<summary> 1. Ubuntu Setup </summary>
<br>
Go to the detailed Ubuntu Docker setup guide: **<a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/setup/docker/stand-alone/ubuntu/README.md" target="_blank">SETUP_STANDALONE_DOCKER_UBUNTU.md</a>**
</details>

<details>
<summary> 2. macOS Setup </summary>
<br>
Go to the detailed macOS Docker setup guide: **<a href="link/to/standalone/docker/macos/README" target="_blank">SETUP_STANDALONE_DOCKER_MACOS.md</a>**
</details>

<details>
<summary> 3. Windows Setup </summary>
<br>
Go to the detailed Windows Docker setup guide: **<a href="link/to/standalone/docker/windows/README" target="_blank">SETUP_STANDALONE_DOCKER_WINDOWS.md</a>**
</details>

<br>

#### II. Native Setup (PM2 Managed Services)

<details>
<summary> 1. Ubuntu Setup </summary>
<br>
Go to the detailed Ubuntu Native setup guide: **<a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/3.4.0/setup/native/stand-alone/ubuntu/README.md" target="_blank">SETUP_STANDALONE_NATIVE_UBUNTU.md</a>**
</details>

<details>
<summary> 2. macOS Setup </summary>
<br>
Go to the detailed macOS Native setup guide: **<a href="link/to/standalone/native/macos/README" target="_blank">SETUP_STANDALONE_NATIVE_MACOS.md</a>**
</details>

<details>
<summary> 3. Windows Setup </summary>
<br>
Go to the detailed Windows Native setup guide: **<a href="link/to/standalone/native/windows/README" target="_blank">SETUP_STANDALONE_NATIVE_WINDOWS.md</a>**
</details>

</details>

---

### 🚀 **WITH SAMIKSHA SERVICE (Integrated Deployment)**

<details>
<summary> **Click to Expand Integrated Setup Options** </summary>
<br>

This setup integrates the Projects Service with the **Samiksha Service**, providing a full-featured, production-ready deployment environment.

#### I. Docker Setup (Recommended)

<details>
<summary> 1. Ubuntu Setup </summary>
<br>
Go to the detailed Ubuntu Docker setup guide: **<a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuideWithSurvey/documentation/3.4.0/setup/docker/project-with-survey/ubuntu/README.md" target="_blank">SETUP_SAMIKSHA_DOCKER_UBUNTU.md</a>**
</details>

<details>
<summary> 2. macOS Setup </summary>
<br>
Go to the detailed macOS Docker setup guide: **<a href="link/to/samiksha/docker/macos/README" target="_blank">SETUP_SAMIKSHA_DOCKER_MACOS.md</a>**
</details>

<details>
<summary> 3. Windows Setup </summary>
<br>
Go to the detailed Windows Docker setup guide: **<a href="link/to/samiksha/docker/windows/README" target="_blank">SETUP_SAMIKSHA_DOCKER_WINDOWS.md</a>**
</details>

<br>

#### II. Native Setup (PM2 Managed Services)

<details>
<summary> 1. Ubuntu Setup </summary>
<br>
Go to the detailed Ubuntu Native setup guide: **<a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuideWithSurvey/documentation/3.4.0/setup/native/project-with-survey/ubuntu/README.md" target="_blank">SETUP_SAMIKSHA_NATIVE_UBUNTU.md</a>**
</details>

<details>
<summary> 2. macOS Setup </summary>
<br>
Go to the detailed macOS Native setup guide: **<a href="link/to/samiksha/native/macos/README" target="_blank">SETUP_SAMIKSHA_NATIVE_MACOS.md</a>**
</details>

<details>
<summary> 3. Windows Setup </summary>
<br>
Go to the detailed Windows Native setup guide: **<a href="link/to/samiksha/native/windows/README" target="_blank">SETUP_SAMIKSHA_NATIVE_WINDOWS.md</a>**
</details>

</details>

---

## 📖 Related Documentation & Tools

### Versioning & Documentation Links

This README is focused on the **3.4.0 Setup Guide** for the Projects Service.

-   **Current Version (3.4.0) Documentation:** All setup links above point to the **3.4.0** guides.
-   **Legacy Version (1.0.0) Documentation:** Access the documentation for the previous major release here: **<a href="https://github.com/ELEVATE-Project/project-service/blob/setupGuide-3.4/documentation/1.0.0/ReadMe.md" target="_blank">View 1.0.0 Documentation</a>**

# 📊 Database Architecture Diagrams

Explore the database schemas for the ELEVATE-Project services below. Click on a service name to expand and view the diagram.

---

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

---

> **Tip:** If the diagrams appear too small, you can right-click the image and select "Open image in new tab" to view the full-resolution architectural details.

### Postman Collections

-   **<a href="https://github.com/ELEVATE-Project/project-service/tree/main/api-doc" target="_blank">Projects Service API Collection</a>**

### Adding New Projects to the System

With implementation scripts, you can seamlessly add new projects to the system. Once a project is successfully added, it becomes visible on the portal, ready for use and interaction. For a comprehensive guide on setting up and using the implementation script, please refer to the **<a href="https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script" target="_blank">documentation here</a>**.

---

## 🤝 Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

### Open Source Dependencies

Several open source dependencies that have aided Projects's development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
