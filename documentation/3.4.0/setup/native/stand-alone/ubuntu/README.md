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

</details>
</details>

</br>
The Project building block facilitates the creation and engagement with micro-improvement projects.

</div>
</br>

# Supported Operating Systems

-   **Ubuntu (Recommended: Version 20 and above)**

# Native Setup - Stand Alone

<summary>Natively Installed Services & Dependencies </summary>

## PM2 Managed Services & Natively Installed Dependencies

### System Requirements

-   **Node.js®:** v20
-   **PostgreSQL:** 16
-   **Apache Kafka®:** 3.5.0
-   **MongoDB:** 4.4.14
-   **Gotenberg:** 8.5.0

Expectation: Upon following the prescribed steps, you will achieve a fully operational ELEVATE-Project application setup. Both the portal and backend services are managed using PM2, with all dependencies installed natively on the host system.

## Prerequisites

Before setting up the following ELEVATE-Project application, dependencies given below should be installed and verified to be running. Refer to the steps given below to install them and verify.

1. Download dependency management scripts:

   ```
     curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/scripts/stand-alone/ubuntu/check-dependencies.sh && \
     curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/scripts/stand-alone/ubuntu/install-dependencies.sh && \
     curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/scripts/stand-alone/ubuntu/uninstall-dependencies.sh && \
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
     git clone -b master https://github.com/ELEVATE-Project/notification.git && \
     git clone -b main https://github.com/ELEVATE-Project/interface-service.git && \
     git clone -b master https://github.com/ELEVATE-Project/scheduler.git && \
     git clone -b release-3.4.0 https://github.com/ELEVATE-Project/observation-survey-projects-pwa && \
     git clone -b releaase-1.1.0 https://github.com/ELEVATE-Project/elevate-portal && \
     git clone -b release-3.4.0 https://github.com/ELEVATE-Project/observation-portal

   ```

3.  **Install NPM Packages**

   ```
     cd project-service && npm install && cd ../ && \
     cd entity-management/src && npm install && cd ../.. && \
     cd user/src && npm install && cd ../.. && \
     cd entity-management\src && npm install && cd ..\.. && \
     cd notification/src && npm install && cd ../.. && \
     cd interface-service/src && npm install && cd ../.. && \
     cd scheduler/src && npm install && cd ../.. && \
     cd observation-survey-projects-pwa && npm install --force && cd .. && \
     cd observation-portal && npm install --force && cd .. && \
     cd elevate-portal && npm install --force && cd ..
   ```

4.  **Download Environment Files**

   ```
     curl -L -o project-service/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/envs/project_env && \
     curl -L -o entity-management/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/envs/entity_management_env && \
     curl -L -o user/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/envs/user_env && \
     curl -L -o notification/src/.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/notification_env && \
     curl -L -o interface-service/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/interface_env && \
     curl -L -o scheduler/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/envs/scheduler_env && \
     curl -L -o observation-survey-projects-pwa/src/assets/env/env.js https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/observation_survey_projects_pwa_env && \
     curl -L -o elevate-portal/env.js https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/elevate_portal_env && \
     curl -L -o observation-portal/src/assets/env/env.js https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/observation_portal_env
   ```

> **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/project-service/blob/main/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) and [Entity-Management](https://github.com/ELEVATE-Project/entity-management/blob/main/src/.env.sample) repositories for reference.

> **Caution:** While the default values in the downloaded environment files enable the ELEVATE-Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

> **Important:** As mentioned in the above linked document, the **User SignUp** functionality may be compromised if key environment variables are not set correctly during deployment. If you opt to skip this setup, consider using the sample user account generator detailed in the `Sample User Accounts Generation` section of this document.

5.  **Create Databases**

    1. Download `create-databases.sh` Script File:

      ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/scripts/stand-alone/ubuntu/create-databases.sh
      ```

    2. Make the executable by running the following command:
      ```
        chmod +x create-databases.sh
      ```
    3. Run the script file:
      ```
        ./create-databases.sh
      ```

6.  **Run Migrations To Create Tables**

      ```
        cd user/src && npx sequelize-cli db:migrate && cd ../.. && \
        cd notification/src && npx sequelize-cli db:migrate && cd ../..
      ```

7.  **Enabling Citus And Setting Distribution Columns (Optional)**

    To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

    > NOTE: Currently only available for Linux based operation systems.

    1. Download user `distributionColumns.sql` file.

        ```
        curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/distribution-columns/user/distributionColumns.sql
        ```

    2. Set up the `citus_setup` file by following the steps given below.

       1. Download the `citus_setup.sh` file:

           ```
             curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/linux/citus_setup.sh

           ```

        2. Make the setup file executable by running the following command:

           ```
             chmod +x citus_setup.sh
           ```

        3. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.
           ```
             ./citus_setup.sh user postgres://postgres:postgres@localhost:9700/users
           ```

8.  **Insert Initial Data**

    1.  Download `entity-project-sample-data.sh` Script File:

      ```
      curl -o project_entity_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/scripts/stand-alone/ubuntu/project_entity_sample_data.sh && \
      ./project_entity_sample_data.sh
      ```

9.  **Insert Forms Data into Database**


      ```
      curl -s https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/linux/import_forms.js | node
      ```

10. **Start The Services**

    Following the steps given below, 2 instances of each ELEVATE-Project backend service will be deployed and be managed by PM2 process manager.

    ```
      (cd project-service && pm2 start app.js --name project-service && cd -) && \
      (cd entity-management/src && pm2 start app.js --name entity-management && cd -) && \
      (cd user/src && pm2 start app.js --name user && cd -) && \
      (cd notification/src && pm2 start app.js --name notification && cd -) && \
      (cd interface-service/src && pm2 start app.js --name interface && cd -) && \
      (cd scheduler/src && pm2 start app.js --name scheduler && cd -)
    ```

11. **Run Service Scripts**

    ```
      cd user/src/scripts && node insertDefaultOrg.js && node viewsScript.js && cd ../../..
     ```

12. **Start The Portal**

    ELEVATE-Project portal utilizes Ionic for building the browser bundle, follow the steps given below to install them and start the portal.

    1. Install the Ionic framework:

       ```
         npm install -g ionic
       ```

    2. Install the Ionic client:

       ```
         npm install -g @ionic/cli
       ```

    3. Navigate to `observation-survey-projects-pwa` directory:

       ```
         cd observation-survey-projects-pwa
       ```

    4. Run the project on your local system using the following command:

       ```
         ionic serve
       ```

    Navigate to http://localhost:8100 to access the ELEVATE-Project Portal.

## Sample User Accounts Generation

During the initial setup of ELEVATE-Project services with the default configuration, you may encounter issues creating new accounts through the regular SignUp flow on the ELEVATE-Project portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the ELEVATE-Project services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

```
curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuide-3.4/documentation/3.4.0/native/scripts/stand-alone/ubuntu/insert_sample_data.sh && \
chmod +x insert_sample_data.sh && \
./insert_sample_data.sh
```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID               | Password   | Role                    |
| ---------------------- | ---------- | ----------------------- |
| mallanagouda@gmail.com | Password1@ | State Education Officer |
| prajwal@gmail.com      | Password1@ | State Education Officer |
| vishnu@gmail.com       | Password1@ | State Education Officer |

## Postman Collections

-   [Projects Service](https://github.com/ELEVATE-Project/project-service/tree/main/api-doc)

## Adding New Projects to the System

With implementation scripts, you can seamlessly add new projects to the system. Once a project is successfully added, it becomes visible on the portal, ready for use and interaction. For a comprehensive guide on setting up and using the implementation script, please refer to the [documentation here](https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script).

# Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

# Open Source Dependencies

Several open source dependencies that have aided Projects's development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
