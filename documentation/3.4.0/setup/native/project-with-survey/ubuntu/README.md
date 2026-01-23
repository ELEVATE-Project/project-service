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


</br>
The Project building block facilitates the creation and engagement with micro-improvement projects.

</div>
</br>

# Native Setup Project Service - With Survey (Ubuntu)

</details>

### System Requirements

-   **Node.js®:** v20
-   **PostgreSQL:** 16
-   **Apache Kafka®:** 3.5.0
-   **MongoDB:** 4.4.14
-   **Gotenberg:** 8.5.0

Expectation: By following these steps, you will establish a unified environment for the Project Service, integrated with the Survey and Observation modules. This setup focuses purely on the backend API infrastructure required to manage data collection and reporting.

Before setting up the following ELEVATE-Project application, dependencies given below should be installed and verified to be running. Refer to the steps given below to install them and verify.

1. Download dependency management scripts:

    ```
    curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/check-dependencies.sh && \
    curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/install-dependencies.sh && \
    curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/uninstall-dependencies.sh && \
    chmod +x check-dependencies.sh && \
    chmod +x install-dependencies.sh && \
    chmod +x uninstall-dependencies.sh
    ```

2. Verify installed dependencies by running `check-dependencies.sh`:

    ```
    ./check-dependencies.sh
    ```

    > Note: Keep note of any missing dependencies.

3. Install dependencies by running `install-dependencies.sh`:
    ```
    ./install-dependencies.sh
    ```
    > Note: Install all missing dependencies and use check-dependencies script to ensure everything is installed and running.
4. Uninstall dependencies by running `uninstall-dependencies.sh`:

    ```
    ./uninstall-dependencies.sh
    ```

    > Warning: Due to the destructive nature of the script (without further warnings), it should only be used during the initial setup of the dependencies. For example, Uninstalling PostgreSQL/Citus using script will lead to data loss. USE EXTREME CAUTION.

    > Warning: This script should only be used to uninstall dependencies that were installed via installation script in step 3. If same dependencies were installed using other methods, refrain from using this script. This script is provided in-order to reverse installation in-case issues arise from a bad install.

## Installation

1.  **Create ELEVATE-Project Directory:** Create a directory named **ELEVATE-Project**.

    > Example Command: `mkdir ELEVATE-Project && cd ELEVATE-Project/`

2.  **Git Clone Services And Portal Repositories**

```
git clone -b develop https://github.com/ELEVATE-Project/project-service.git && \
git clone -b develop https://github.com/ELEVATE-Project/entity-management.git && \
git clone -b develop https://github.com/ELEVATE-Project/user.git && \
git clone -b main https://github.com/ELEVATE-Project/interface-service.git && \
git clone -b develop https://github.com/ELEVATE-Project/samiksha-service && \
git clone -b master https://github.com/ELEVATE-Project/scheduler.git
```

3.  **Install NPM Packages**

```
cd project-service && npm install && cd ../ && \
cd samiksha-service && npm install && cd ../ && \
cd entity-management/src && npm install && cd ../.. && \
cd user/src && npm install && cd ../.. && \
cd interface-service/src && npm install && cd ../.. && \
cd scheduler/src && npm install && cd ../..
```

4.  **Download Environment Files**

```
curl -L -o project-service/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/envs/project-with-survey/project_env && \
curl -L -o samiksha-service/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/envs/project-with-survey/samiksha_env && \
curl -L -o entity-management/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/envs/project-with-survey/entity_management_env && \
curl -L -o user/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/envs/project-with-survey/user_env && \
curl -L -o interface-service/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/envs/project-with-survey/interface_env && \
curl -L -o scheduler/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/envs/project-with-survey/scheduler_env
```

> **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/project-service/blob/main/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) and [Entity-Management](https://github.com/ELEVATE-Project/entity-management/blob/main/src/.env.sample) repositories for reference.

> **Caution:** While the default values in the downloaded environment files enable the ELEVATE-Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

> **Important:** As mentioned in the above linked document, the **User SignUp** functionality may be compromised if key environment variables are not set correctly during deployment. If you opt to skip this setup, consider using the sample user account generator detailed in the `Sample User Accounts Generation` section of this document.

5.  **Attaching Config File**

    ```
    curl -L -o project-service/config.json https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/native/project-with-survey/configFile.json && \
    curl -L -o samiksha-service/config.json https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/native/project-with-survey/configFile.json && \
    curl -L -o entity-management/src/config.json https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/common-files/native/project-with-survey/configFile.json
    ```

6.  **Create Databases**

    1. Download `create-databases.sh` Script File:

    ```
    curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/create-databases.sh
    ```

    2. Make the executable by running the following command:

    ```
    chmod +x create-databases.sh
    ```

    3. Run the script file:

    ```
    ./create-databases.sh
    ```

7.  **Run Migrations and Seed To Create Tables**

    1. run migrations

        ```
        cd user/src && npx sequelize-cli db:migrate && cd ../..
        ```

    2. run Seed
        ```
        cd user/src && npx sequelize-cli db:seed:all && cd ../../
        ```

8.  **Enabling Citus And Setting Distribution Columns (Optional)**

    To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

    > NOTE: Currently only available for Linux based operation systems.

    1. Download user `distributionColumns.sql` file.

        ```
        curl -o ./user/distributionColumns.sql -JL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/distribution-columns/user/distributionColumns.sql
        ```

    2. Set up the `citus_setup` file by following the steps given below.

        1. Download the `citus_setup.sh` file:

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/citus_setup.sh
            ```

        2. Make the setup file executable by running the following command:

            ```
            chmod +x citus_setup.sh
            ```

        3. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.
            ```
             ./citus_setup.sh user postgres://postgres:postgres@localhost:9700/users
            ```

9.  **Update Cloud Credentials for Project Service**

    To enable full functionality—including certificate generation, attachment uploads, and report storage—you must configure cloud credentials in the environment files for both services.

    A. Project Service Configuration Path:
    	```./ELEVATE-Project/project-service/.env
    	```

    B. Samiksha (Survey & Observation) Service Configuration Path:
    	```./ELEVATE-Project/samiksha-service/.env
    	```



       Add or update the following variables in the .env file, substituting the example values with your actual cloud credentials:

        CLOUD_STORAGE_PROVIDER=gcloud
        CLOUD_STORAGE_ACCOUNTNAME=your_account_name
        CLOUD_STORAGE_SECRET="-----BEGIN PRIVATE KEY-----\n..."
        CLOUD_STORAGE_PROJECT=your_cloud_project_id
        CLOUD_STORAGE_BUCKETNAME=your_bucket_name
        CLOUD_STORAGE_BUCKET_TYPE=private

    > NOTE : This service is designed to support multiple cloud storage providers and offers flexible cloud integration capabilities. Based on your selected cloud provider, the service can be configured accordingly to enable seamless storage, certificate generation, and report handling.

    For detailed configuration options, supported cloud providers, and integration guidelines, please refer to the official documentation available in this [ReadMe](https://www.npmjs.com/package/client-cloud-services?activeTab=readme)

11. **Insert Initial Data**

    1.  Download `entity-project-sample-data.sh` Script File:

    ```
    curl -o project_entity_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/project_entity_sample_data.sh && \
    chmod +x project_entity_sample_data.sh && \
    ./project_entity_sample_data.sh
    ```

12. **Start The Services**

    Following the steps given below, 2 instances of each ELEVATE-Project backend service will be deployed and be managed by PM2 process manager.

    ```
    (cd project-service && pm2 start app.js --name project-service && cd -) && \
    (cd samiksha-service && pm2 start app.js --name samiksha-service && cd -) && \
    (cd entity-management/src && pm2 start app.js --name entity-management && cd -) && \
    (cd user/src && pm2 start app.js --name user && cd -) && \
    (cd interface-service/src && pm2 start app.js --name interface && cd -) && \
    (cd scheduler/src && pm2 start app.js --name scheduler && cd -)
    ```


## Sample User Accounts Generation

During the initial setup of ELEVATE-Project services with the default configuration, you may encounter issues creating new accounts through the regular SignUp flow on the ELEVATE-Project portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the ELEVATE-Project services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

```
curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/3.4.0/native/scripts/project-with-survey/ubuntu/insert_sample_data.sh && \
chmod +x insert_sample_data.sh && \
./insert_sample_data.sh
```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID               | Password   | Role                    |
| ---------------------- | ---------- | ----------------------- |
| mallanagouda@gmail.com | Password1@ | State Education Officer |
| prajwal@gmail.com      | Password1@ | State Education Officer |
| vishnu@gmail.com       | Password1@ | State Education Officer |

---


## 🌐 Micro-Frontend (FE) Setup

The ELEVATE application uses a micro-frontend architecture. After setting up the backend services, you must configure and run the frontend repositories to access the application via the portal.

Follow the setup guides for the frontend repositories:

-   **Login Portal:** [elevate-portal](https://github.com/ELEVATE-Project/elevate-portal/tree/releaase-1.1.0)
-   **Projects Program Module (PWA):** [observation-survey-projects-pwa](https://github.com/ELEVATE-Project/observation-survey-projects-pwa/tree/release-3.4.0)
-   **Observtaion/Survey Portal:** [observation-survey-projects-pwa](https://github.com/ELEVATE-Project/observation-portal/tree/release-3.4.0)

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

# Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

---

# Open Source Dependencies

This project uses several open-source tools and dependencies that supported its development

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)  
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)  
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)  
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)  
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)  
