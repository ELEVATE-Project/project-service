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
-   **Windows (Recommended: Version 11 and above)**
-   **macOs (Recommended: Version 12 and above)**

# Setup Options

**Project services can be setup using two methods:**

> Note : This guide outlines two setup methods, detailed below. For a quick, beginner-friendly setup and walkthrough of services, it is recommended to use the Dockerized Services & Dependencies setup with the Docker-Compose file.

<details><summary>Dockerized Services & Dependencies Using Docker-Compose File</summary>

## Dockerized Services & Dependencies

Expectation: By diligently following the outlined steps, you will successfully establish a fully operational Project application setup, including both the portal and backend services.

## Prerequisites

To set up the Project application, ensure you have Docker and Docker Compose installed on your system. For Ubuntu users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). To install and use Nodejs in Ubuntu machine, you can follow instructions here: [How To Install Nodejs in Ubuntu](https://nodejs.org/en/download/package-manager). For Windows and MacOS users, you can refer to the Docker documentation for installation instructions: [Docker Compose Installation Guide](https://docs.docker.com/compose/install/). Once these prerequisites are in place, you're all set to get started with setting up the Project application.

## Installation

**Create project Directory:** Establish a directory titled **project**.

> Example Command: `mkdir project && cd project/`

> Note: All commands are run from the project directory.

## Operating Systems: Linux / macOS

> **Caution:** Before proceeding, please ensure that the ports given here are available and open. It is essential to verify their availability prior to moving forward. You can run below command in your terminal to check this

```
for port in 3000 3001 3002 6000 5001 4000 9092 5432 7007 2181 2707 3569; do
    if lsof -iTCP:$port -sTCP:LISTEN &>/dev/null; then
        echo "Port $port is in use"
    else
        echo "Port $port is available"
    fi
done
```

1.  **Download and execute main setup script:** Execute the following command in your terminal from the project directory.
    `    curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/setup_project.sh && chmod +x setup_project.sh && sudo ./setup_project.sh
   `

        > Note : The script will download all the essential files and launch the services in Docker. Once all services are successfully up and running, you can proceed to the next steps.

        **General Instructions :**

        1. All containers which are part of the docker-compose can be gracefully stopped by pressing Ctrl + c in the same terminal where the services are running.

        2. All docker containers can be stopped and removed by using below command.
            ```
            sudo ./docker-compose-down.sh
            ```
        3. All services and dependencies can be started using below command.
            ```
            sudo ./docker-compose-up.sh
            ```

    **Keep the current terminal session active, and kindly open a new terminal window within the project directory.**

**After successfully completing this, please move to the next section: [Enable Citus Extension](#enable-citus-extension-optional)**

## Operating Systems: Windows

1.  **Download Docker Compose File:** Retrieve the **[docker-compose-project.yml](https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/docker-compose-project.yml)** file from the Project service repository and save it to the project directory.

    ```
    curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/docker-compose-project.yml
    ```

    > Note: All commands are run from the project directory.

2.  **Download Environment Files**: Using the OS specific commands given below, download environment files for all the services.

    -   **Windows**

        ```
        curl -L ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/interface_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/entity_management_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/project_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/notification_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/scheduler_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/user_env ^
         -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/envs/env.js
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/project-service/blob/main/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) and [Entity-management](https://github.com/ELEVATE-Project/entity-management/blob/main/src/.env.sample) repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

3.  **Download `replace_volume_path` Script File**

    -   **Windows**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/dockerized/scripts/windows/replace_volume_path.bat
        ```

4.  **Run `replace_volume_path` Script File**

    -   **Windows**

        Run the script file either by double clicking it or by executing the following command from the terminal.

        ```
        replace_volume_path.bat
        ```

        > **Note**: The provided script file replaces the host path for the **portal** service container volume in the `docker-compose-project.yml` file with your current directory path.
        >
        > volumes:
        >
        > \- /home/shikshalokam/elevate/single-click/linux/env.js:/usr/src/app/www/assets/env/env.js

5.  **Download `docker-compose-up` & `docker-compose-down` Script Files**

    -   **Windows**

        ```
        curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/docker-compose-up.bat
        ```

        ```
        curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/docker-compose-down.bat
        ```

6.  **Run All Services & Dependencies**:All services and dependencies can be started using the `docker-compose-up` script file.

    -   **Windows**

        ```
        docker-compose-up.bat
        ```

        > Double-click the file or run the above command from the terminal.

        > **Note**: During the first Docker Compose run, the database, migration seeder files, and the script to set the default organization will be executed automatically.

7.  **Remove All Service & Dependency Containers**:
    All docker containers can be stopped and removed by using the `docker-compose-down` file.

    -   **Windows**

        ```
        docker-compose-down.bat
        ```

    > **Caution**: As per the default configuration in the `docker-compose-project.yml` file, using the `down` command will lead to data loss since the database container does not persist data. To persist data across `down` commands and subsequent container removals, refer to the "Persistence of Database Data in Docker Containers" section of this documentation.

## Enable Citus Extension (Optional)

User management service comes with this bundle relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

For more information, refer **[Citus Data](https://www.citusdata.com/)**.

To enable the Citus extension for user services, follow these steps.

1. Create a sub-directory named `user` and download `distributionColumns.sql` into it. (Skip this for linux/macOs)
    ```
    mkdir user && curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/distribution-columns/user/distributionColumns.sql
    ```
2. Set up the citus_setup file by following the steps given below.

    - **Ubuntu/Linux/Mac**

        1. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.
            ```
            sudo ./citus_setup.sh user postgres://postgres:postgres@citus_master:5432/user
            ```

    - **Windows**
        1. Download the `citus_setup.bat` file.
            ```
             curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/citus_setup.bat
            ```
        2. Enable Citus and set distribution columns for `user` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat user postgres://postgres:postgres@citus_master:5432/user
            ```
            > **Note:** Since the `citus_setup.bat` file requires arguments, it must be run from a terminal.

## Persistence Of Database Data In Docker Container (Optional)

To ensure the persistence of database data when running `docker compose down`, it is necessary to modify the `docker-compose-project.yml` file according to the steps given below:

1. **Modification Of The `docker-compose-project.yml` File:**

    Begin by opening the `docker-compose-project.yml` file. Locate the section pertaining to the Citus and mongo container and proceed to uncomment the volume specification. This action is demonstrated in the snippet provided below:

    ```yaml
    mongo:
    image: 'mongo:4.4.14'
    restart: 'always'
    ports:
        - '27017:27017'
    networks:
        - project_net
    volumes:
        - mongo-data:/data/db
    logging:
        driver: none

    citus:
        image: citusdata/citus:11.2.0
        container_name: 'citus_master'
        ports:
            - 5432:5432
        volumes:
            - citus-data:/var/lib/postgresql/data
    ```

2. **Uncommenting Volume Names Under The Volumes Section:**

    Next, navigate to the volumes section of the file and proceed to uncomment the volume names as illustrated in the subsequent snippet:

    ```yaml
    networks:
        elevate_net:
            external: false

    volumes:
        citus-data:
        mongo-data:
    ```

By implementing these adjustments, the configuration ensures that when the `docker-compose down` command is executed, the database data is securely stored within the specified volumes. Consequently, this data will be retained and remain accessible, even after the containers are terminated and subsequently reinstated using the `docker-compose up` command.

## Sample User Accounts Generation

During the initial setup of Project services with the default configuration, you may encounter issues creating new accounts through the regular SignUp flow on the project portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the Project services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

-   **Ubuntu/Linux/Mac**

    ```
    sudo ./insert_sample_data.sh user postgres://postgres:postgres@citus_master:5432/user
    ```

-   **Windows**

    1. **Download The `sampleData.sql` Files:**

        ```
        mkdir sample-data\user 2>nul & ^
        curl -L "https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/sample-data/windows/user/sampleData.sql" -o sample-data\user\sampleData.sql
        ```

    2. **Download The `insert_sample_data` Script File:**

        ```
        curl -L -o insert_sample_data.bat https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/dockerized/scripts/windows/insert_sample_data.bat
        ```

    3. **Run The `insert_sample_data` Script File:**

        ```
        insert_sample_data.bat user postgres://postgres:postgres@citus_master:5432/user
        ```

    After successfully running the script mentioned above, the following user accounts will be created and available for login:

    | Email ID                 | Password   | Role                    |
    | ------------------------ | ---------- | ----------------------- |
    | aaravpatel@example.com   | Password1@ | State Education Officer |
    | arunimareddy@example.com | Password1@ | State Education Officer |
    | devikasingh@example.com  | Password1@ | State Education Officer |

## Sample Data Creation For Projects

This step will guide us in implementing a sample project solution following the initial setup of the project service.

1. **Insert Sample Data To Database:**

    - **Ubuntu/Linux/Mac**

        1. Insert sample data by running the following command.

            ```
            sudo ./add_sample_project_entity_data.sh
            ```

    - **Windows**

        1. Download `entity-project-sample-data.bat` Script File:

            ```
            curl -L ^
            -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/entity-project-sample-data.bat ^
            ```

        2. Make the setup file executable by running the following command.

            ```
            entity-project-sample-data.bat
            ```

## Default Forms Creation for Portal Configuration

This step inserts configuration forms into MongoDB, enabling or disabling features and fields on portal pages.

#### Insert Forms Data into Database

-   **Ubuntu/Linux/Mac**:

    ```
    curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/import_forms_mongo.sh && chmod +x import_forms_mongo.sh && sudo ./import_forms_mongo.sh mongodb://mongo:27017/elevate-project
    ```

-   **Windows**:
    1. Download the `import_forms_mongo.bat` file:
        ```cmd
        curl -L -O https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/windows/import_forms_mongo.bat
        ```
    2. Run the script:
        ```cmd
        import_forms_mongo.bat mongodb://localhost:27017/elevate-project
        ```

## Explore the Portal

Once the services are up and the front-end app bundle is built successfully, navigate to **[localhost:7007](http://localhost:7007/)** to access the Project app.

> **Warning:** In this setup, features such as **Sign-Up, Project Certificate, Project Sharing, and Project PDF Report** will not be available because cloud storage credentials have been masked in the environment files for security reasons.

</details>

<details>
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

-   **Ubuntu/Linux**

    1. Download dependency management scripts:

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/linux/check-dependencies.sh && \
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/linux/install-dependencies.sh && \
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/linux/uninstall-dependencies.sh && \
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

-   **MacOS**

    1. Install Node.js 20:

        ```
        brew install node@20
        ```

        ```
        brew link --overwrite node@20
        ```

    2. Install Kafka:

        ```
        brew install kafka
        ```

        > Note: To install Kafka on older macOS versions like Monterey (Intel architecture), you need to follow the manual installation process instead of using Homebrew. The process includes downloading Kafka, setting up ZooKeeper, and running Kafka services. You can find the official Kafka installation guide here: [Kafka Quickstart Guide](https://kafka.apache.org/quickstart).This ensures compatibility with older macOS systems. Follow the steps outlined in the documentation for a smooth setup.

    3. Install PostgreSQL 16:

        ```
        brew install postgresql@16
        ```

    4. Install PM2:

        ```
        sudo npm install pm2@latest -g
        ```

    5. Install Redis:

        ```
        brew install redis
        ```

    6. Install mongDB:

        ```
        brew tap mongodb/brew
        ```

        ```
        brew install mongodb-community@4.4
        ```

        ```
        brew link mongodb-community@4.4 --force
        ```

        ```
        brew services start mongodb-community@4.4
        ```

    7. Download `check-dependencies.sh` file:

        ```
        curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/native/scripts/macos/check-dependencies.sh && \
        chmod +x check-dependencies.sh
        ```

    8. Verify installed dependencies by running `check-dependencies.sh`:

        ```
        ./check-dependencies.sh
        ```

        > Note : If you've manually installed Kafka without Homebrew, the script might incorrectly indicate that Kafka and Homebrew are not installed, as it checks only for Homebrew installations. In such cases, you can safely ignore this warning. Ensure that both Kafka and ZooKeeper are running on their default ports (ZooKeeper on `2181`, Kafka on `9092`). This will confirm proper installation and functionality despite the script's output.

-   **Windows**

    1. Install Node.js 20:

        Download and install Node.js v20 for Windows platform (x64) from official [Node.js download page](https://nodejs.org/en/download).

    2. Install Kafka 3.5.0:

        1. Adapt the instructions given in the following ["Apache Kafka on Windows"](https://www.conduktor.io/kafka/how-to-install-apache-kafka-on-windows/) documentation to install Kafka version 3.5.0.

            > Note: As per the instructions, Kafka server and Zookeeper has to be kept active on different WSL terminals for the entire lifetime of ELEVATE-Project services.

            > Note: Multiple WSL terminals can be opened by launching `Ubuntu` from start menu.

        2. Open a new WSL terminal and execute the following command to get the IP of the WSL instance.

            ```
            ip addr show eth0
            ```

            Sample Output:

            ```
            2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1492 qdisc mq state UP group default qlen 1000
            link/ether 11:56:54:f0:as:vf brd ff:ff:ff:ff:ff:ff
            inet 172.12.46.150/20 brd 172.24.79.255 scope global eth0
                valid_lft forever preferred_lft forever
            inet6 fe80::215:5dff:fee7:dc52/64 scope link
                valid_lft forever preferred_lft forever
            ```

            Keep note of the IP address shown alongside `inet`. In the above case, `172.12.46.150` is IP address of the WSL instance.

        3. In the same WSL terminal, navigate to `config` directory of Kafka from step 1 and make the following changes to `server.properties` file.

            - Uncomment `listeners=PLAINTEXT://:9092` line and change it to `listeners=PLAINTEXT://0.0.0.0:9092` to allow connections from any IP.

            - Uncomment `advertised.listeners` line and set it to `advertised.listeners=PLAINTEXT://172.12.46.150:9092`. Replace `172.12.46.150` with the actual IP address of your WSL instance.

        4. Restart the Zookeeper and Kafka Server from their own WSL terminals from step 1.

    3. Install Redis:

        1. Follow the instructions given in the official [Redis Documentation](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-windows/) to install Redis using WSL.

        2. Using the WSL terminal, open the Redis configuration file in a text editor, such as nano:

            ```
            sudo nano /etc/redis/redis.conf
            ```

        3. Find the line containing `bind 127.0.0.1 ::1` and change it to `bind 0.0.0.0 ::.`. This change allows Redis to accept connections from any IP address. Then save and exit the file.

        4. Restart Redis to apply the changes:

            ```
            sudo service redis-server restart
            ```

    4. Install PM2:

        ```
        npm install pm2@latest -g
        ```

    5. Install PostgreSQL 16:

        1. Download and install PostgreSQL 16 from [EnterpriseDB PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) download page.

            > Note: Set username and password for the default database to be 'postgres' during installation.

        2. Once installed, Add `C:\Program Files\PostgreSQL\16\bin` to windows environment variables. Refer [here](https://www.computerhope.com/issues/ch000549.htm) or [here](https://stackoverflow.com/a/68851621) for more information regarding how to set it.

    6. Install MongoDB:

        Follow the official [MongoDB Website](https://www.mongodb.com/try/download/community) to install MongoDB.

    7. Install Gotenberg via Docker:

        1. Download Docker Desktop for Windows from [Docker Website](https://docs.docker.com/desktop/setup/install/windows-install/)

        2. Run the installer and follow the setup instructions.

        3. Ensure Docker Desktop is running and configured to use Linux containers(default settings).

        4. Open a terminal (e.g., Command Prompt).

        5. Pull the Gotenberg image:

            ```
            docker pull gotenberg/gotenberg:latest
            ```

        6. Run the Gotenberg container with the following command:

            ```
            docker run -d --name gotenberg -p 3000:3000 gotenberg/gotenberg:latest
            ```

        7. Verify the container is running. You should see the Gotenberg container listed after running the below command.
            ```
            docker ps
            ```

## Installation

1.  **Create ELEVATE-Project Directory:** Create a directory named **ELEVATE-Project**.

    > Example Command: `mkdir ELEVATE-Project && cd ELEVATE-Project/`

2.  **Git Clone Services And Portal Repositories**

    -   **Ubuntu/Linux/MacOS**

        ```
        git clone -b main https://github.com/ELEVATE-Project/project-service.git && \
        git clone -b main https://github.com/ELEVATE-Project/entity-management.git && \
        git clone -b master https://github.com/ELEVATE-Project/user.git && \
        git clone -b master https://github.com/ELEVATE-Project/notification.git && \
        git clone -b main https://github.com/ELEVATE-Project/interface-service.git && \
        git clone -b master https://github.com/ELEVATE-Project/scheduler.git && \
        git clone -b main https://github.com/ELEVATE-Project/observation-survey-projects-pwa
        ```

    -   **Windows**

        ```
        git clone -b staging https://github.com/ELEVATE-Project/project-service.git &
        git clone -b staging https://github.com/ELEVATE-Project/entity-management.git &
        git clone -b master https://github.com/ELEVATE-Project/user.git &
        git clone -b master https://github.com/ELEVATE-Project/notification.git &
        git clone -b main https://github.com/ELEVATE-Project/interface-service.git &
        git clone -b master https://github.com/ELEVATE-Project/scheduler.git &
        git clone -b main https://github.com/ELEVATE-Project/observation-survey-projects-pwa
        ```

3.  **Install NPM Packages**

    -   **Ubuntu/Linux/MacOS**

        ```
        cd project-service && npm install && cd ../ && \
        cd entity-management/src && npm install && cd ../.. && \
        cd user/src && npm install && cd ../.. && \
        cd notification/src && npm install && cd ../.. && \
        cd interface-service/src && npm install && cd ../.. && \
        cd scheduler/src && npm install && cd ../.. && \
        cd observation-survey-projects-pwa && npm install --force && cd ..
        ```

    -   **Windows**

        ```
        cd project-service && npm install && cd ..
        cd user\src && npm install && cd ..\..
        cd notification\src && npm install && cd ..\..
        cd interface-service\src && npm install && cd ..\..
        cd scheduler\src && npm install && cd ..\..
        cd observation-survey-projects-pwa && npm install --force && cd ..
        ```

        > Note: Entity-management service runs only on node-16 for Windows native setup.

        ```
        nvm use 16
        ```

        ```
        cd entity-management\src && npm install && cd ..\..
        ```

        > Note: Change the node version as it was before.

4.  **Download Environment Files**

    -   **Ubuntu/Linux**

        ```
        curl -L -o project-service/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/project_env && \
        curl -L -o entity-management/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/entity_management_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/notification_env && \
        curl -L -o interface-service/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/scheduler_env && \
        curl -L -o observation-survey-projects-pwa/src/environments/environment.ts https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/enviroment.ts
        ```

    -   **MacOs**

        ```
        curl -L -o project-service/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/project_env && \
        curl -L -o entity-management/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/entity_management_env && \
        curl -L -o user/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/non-citus/user_env && \
        curl -L -o notification/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/non-citus/notification_env && \
        curl -L -o interface-service/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/scheduler_env && \
        curl -L -o observation-survey-projects-pwa/src/environments/environment.ts https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/enviroment.ts
        ```

    -   **Windows**

        ```
        curl -L -o project-service\.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/project_env &
        curl -L -o entity-management\src\.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/entity_management_env &
        curl -L -o user\src\.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/user_env &
        curl -L -o notification\src\.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/notification_env &
        curl -L -o interface-service\src\.env https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/interface_env &
        curl -L -o scheduler\src\.env https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/native/envs/scheduler_env &
        curl -L -o observation-survey-projects-pwa\src\environments\environment.ts https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/envs/enviroment.ts
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/project-service/blob/main/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) and [Entity-Management](https://github.com/ELEVATE-Project/entity-management/blob/main/src/.env.sample) repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the ELEVATE-Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

    > **Important:** As mentioned in the above linked document, the **User SignUp** functionality may be compromised if key environment variables are not set correctly during deployment. If you opt to skip this setup, consider using the sample user account generator detailed in the `Sample User Accounts Generation` section of this document.

5.  **Create Databases**

    -   **Ubuntu/Linux**

        1. Download `create-databases.sh` Script File:

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/linux/create-databases.sh
            ```

        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```

    -   **MacOs**

        1. Download `create-databases.sh` Script File:

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/macos/create-databases.sh

            ```

        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```

    -   **Windows**

        1. Download `create-databases.bat` Script File:
            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/windows/create-databases.bat
            ```
        2. Run the script file:
            ```
            create-databases.bat
            ```

6.  **Run Migrations To Create Tables**

    -   **Ubuntu/Linux/MacOS**

        1. Run Migrations:
            ```
            cd user/src && npx sequelize-cli db:migrate && cd ../.. && \
            cd notification/src && npx sequelize-cli db:migrate && cd ../..
            ```

    -   **Windows**

        1. Run Migrations:
            ```
            cd user\src && npx sequelize-cli db:migrate && cd ..\.. && cd notification\src && npx sequelize-cli db:migrate && cd ..\..
            ```

7.  **Enabling Citus And Setting Distribution Columns (Optional)**

    To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

    > NOTE: Currently only available for Linux based operation systems.

    1. Download user `distributionColumns.sql` file.

        ```
        curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/project-service/raw/refs/heads/main/documentation/1.0.0/distribution-columns/user/distributionColumns.sql
        ```

    2. Set up the `citus_setup` file by following the steps given below.

        - **Ubuntu/Linux**

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

    -   **Ubuntu/Linux/MacOS**

        1.  Download `entity-project-sample-data.sh` Script File:

            1.1. For ubuntu/linux

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/linux/entity-project-sample-data.sh
            ```

            1.1. For mac

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/macos/entity-project-sample-data.sh
            ```

        2.  Make the executable by running the following command:
            ```
            chmod +x entity-project-sample-data.sh
            ```
        3.  Run the script file:
            ```
            ./entity-project-sample-data.sh
            ```
        4.  Run seeders of user service
            ```
            cd user/src && npm run db:seed:all && cd ../..
            ```

    -   **Windows**

        1.  Download `entity-project-sample-data.bat` Script File:

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/windows/entity-project-sample-data.bat
            ```

        2.  Run the script file:

            ```
            entity-project-sample-data.bat
            ```

        3.  Run seeders of user service

            ```
            cd user\src && npm run db:seed:all && cd ..\..
            ```

9.  **Insert Forms Data into Database**

    -   **Ubuntu/Linux/MacOS**

        1.  Download `import_forms.js` Script File And Make the setup file executable by running the following command:

            ```
            curl -s https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/linux/import_forms.js | node
            ```

    -   **Windows**

        1.  Download `import_forms_mongo.bat` Script File and execute the file by running the following commands:

            ```
            curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/windows/import_forms_mongo.bat
            ```

            ```
            import_forms_mongo.bat
            ```

10. **Start The Services**

    Following the steps given below, 2 instances of each ELEVATE-Project backend service will be deployed and be managed by PM2 process manager.

    -   **Ubuntu/Linux**

        ```
        (cd project-service && pm2 start app.js --name project-service && cd -) && \
        (cd entity-management/src && pm2 start app.js --name entity-management && cd -) && \
        (cd user/src && pm2 start app.js --name user && cd -) && \
        (cd notification/src && pm2 start app.js --name notification && cd -) && \
        (cd interface-service/src && pm2 start app.js --name interface && cd -) && \
        (cd scheduler/src && pm2 start app.js --name scheduler && cd -)
        ```

    -   **MacOs**

        ```
        cd project-service && npx pm2 start app.js -i 2 --name project-service && cd .. && \
        cd entity-management/src && npx pm2 start app.js -i 2 --name entity-management && cd ../.. && \
        cd user/src && npx pm2 start app.js -i 2 --name user && cd ../.. && \
        cd notification/src && npx pm2 start app.js -i 2 --name notification && cd ../.. && \
        cd interface-service/src && npx pm2 start app.js -i 2 --name interface && cd ../.. && \
        cd scheduler/src && npx pm2 start app.js -i 2 --name scheduler && cd ../..
        ```

    -   **Windows**

        ```
        cd project-service && pm2 start app.js --name project-service && cd ..
        cd entity-management\src && pm2 start app.js --name entity-management && cd ..\..
        cd user\src && pm2 start app.js --name user && cd ..\..
        cd notification\src && pm2 start app.js --name notification && cd ..\..
        cd interface-service\src && pm2 start app.js --name interface && cd ..\..
        cd scheduler\src && pm2 start app.js --name scheduler && cd ..\..
        ```

11. **Run Service Scripts**

    -   **Ubuntu/Linux/MacOS**

        ```
        cd user/src/scripts && node insertDefaultOrg.js && node viewsScript.js && cd ../../..
        ```

    -   **Windows**

        ```
        cd user\src\scripts && node insertDefaultOrg.js && node viewsScript.js && cd ..\..\..
        ```

12. **Start The Portal**

    ELEVATE-Project portal utilizes Ionic for building the browser bundle, follow the steps given below to install them and start the portal.

    -   **Ubuntu/Linux/Windows**

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

-   **Ubuntu/Linux**

    ```
    curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/linux/insert_sample_data.sh && \
    chmod +x insert_sample_data.sh && \
    ./insert_sample_data.sh
    ```

-   **MacOS**

    ```
    curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/main/documentation/1.0.0/native/scripts/macos/insert_sample_data.sh && \
    chmod +x insert_sample_data.sh && \
    ./insert_sample_data.sh
    ```

-   **Windows**

    ```
    curl -o insert_sample_data.bat https://raw.githubusercontent.com/ELEVATE-Project/project-service/main/documentation/1.0.0/native/scripts/windows/insert_sample_data.bat && ^
    insert_sample_data.bat
    ```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID                 | Password   | Role                      |
| ------------------------ | ---------- | ------------------------- |
| aaravpatel@example.com   | Password1@ | State Educational Officer |
| arunimareddy@example.com | Password1@ | State Educational Officer |
| devikasingh@example.com  | Password1@ | State Educational Officer |

</details>

## Postman Collections

-   [Projects Service](https://github.com/ELEVATE-Project/project-service/tree/main/api-doc)

## Adding New Projects to the System

With implementation scripts, you can seamlessly add new projects to the system. Once a project is successfully added, it becomes visible on the portal, ready for use and interaction. For a comprehensive guide on setting up and using the implementation script, please refer to the [documentation here](https://github.com/ELEVATE-Project/project-service/tree/main/Project-Service-implementation-Script).

<!--
    ```sql
    postgres=# select citus_version();
                                           citus_version
    ----------------------------------------------------------------------------------------------------
     Citus 12.1.1 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 9.4.0-1ubuntu1~20.04.2) 9.4.0, 64-bit
    (1 row)
    ``` -->

<!-- ### Install PM2

Refer to [How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04).

**Exit the postgres user account and run the following command**

```bash
$ sudo npm install pm2@latest -g
```

## Setting up Repositories

### Clone the mentoring repository to /opt/backend directory

```bash
opt/backend$ git clone -b develop-2.5 --single-branch "https://github.com/ELEVATE-Project/mentoring.git"
```

### Install Npm packages from src directory

````bash
backend/mentoring/src$ sudo npm i

BigBlueButton™ Service (Optional) can be setup using the following method:

<details><summary>Setting up the BigBlueButton™ Service (Optional)</summary>

## Setting up the BigBlueButton Service (Optional)

## Installation

**Expectation**: Integrate the BigBlueButton meeting platform with the mentoring application.

1. Before installing, ensure that you meet all the prerequisites required to install BigBlueButton. To learn more, see Administration section in [BigBlueButton Docs](https://docs.bigbluebutton.org).

2. Install BigBlueButton version 2.6 using the hostname and email address, which you want to use. To learn more, see Administration section in [BigBlueButton Docs](https://docs.bigbluebutton.org).

3. After completing the installation, check the status of your server using the following command:

    ```
    sudo bbb-conf --check
    ```

    > **Note**: If you encounter any error which is flagged as _Potential problems_, check for installation or configuration errors on your server.

4. Start the service using the following command:

    ```
    sudo bbb-conf --start
    ```

5. Check if the BigBlueButton service is running using the following command:

    ```
    sudo bbb-conf --status
    ```

6. Restart the BigBlueButton server using the following command:

    ```
    sudo bbb-conf --restart
    ```

## Obtaining the Secret Key

If you wish to generate a new secret key, use the following command:

````

sudo bbb-conf --secret

```

## Deleting the Demo Meeting

If you want to delete the demo meeting, use the following command:

```

sudo apt-get purge bbb-demo

````

> **Tip**:
>
> -   To learn more, see the Administration section in <a href="https://docs.bigbluebutton.org">BigBlueButton Docs</a>.
> -   To automatically delete the metadata of recordings which are converted to mp4 format and uploaded on the cloud storage, see <a href="https://github.com/ELEVATE-Project/elevate-utils/tree/master/BBB-Recordings">ELEVATE-Project on GitHub</a>.

</details>

</br>

### Create .env file in src directory

```bash
mentoring/src$ sudo nano .env
````

Copy-paste the following env variables to the `.env` file:

```env
# Mentoring Service Config

# Port on which service runs
APPLICATION_PORT=3000

# Service environment
APPLICATION_ENV=development

# Route after the base URL
APPLICATION_BASE_URL=/mentoring/
APPLICATION_URL=https://dev.mentoring.shikshalokam.org

# Mongo db connectivity URL
MONGODB_URL=mongodb://localhost:27017/elevate-mentoring

# Token secret to verify the access token
ACCESS_TOKEN_SECRET='asadsd8as7df9as8df987asdf'

# Internal access token for communication between services via network call
INTERNAL_ACCESS_TOKEN='internal_access_token'

# Kafka hosted server URL
KAFKA_URL=localhost:9092

# Kafka group to which consumer belongs
KAFKA_GROUP_ID="mentoring"

# Kafka topic to push notification data
NOTIFICATION_KAFKA_TOPIC='develop.notifications'

# Kafka topic name to consume from mentoring topic
KAFKA_MENTORING_TOPIC="mentoringtopic"
SESSION_KAFKA_TOPIC='session'

# Kafka topic to push recording data
KAFKA_RECORDING_TOPIC="recordingtopic"

# Any one of three features available for cloud storage
CLOUD_STORAGE='AWS'
MENTOR_SESSION_RESCHEDULE_EMAIL_TEMPLATE=mentor_session_reschedule

# GCP json config file path
GCP_PATH='gcp.json'

# GCP bucket name which stores files
DEFAULT_GCP_BUCKET_NAME='gcp-bucket-storage-name'

# GCP project id
GCP_PROJECT_ID='project-id'

# AWS access key id
AWS_ACCESS_KEY_ID='aws-access-key-id'

# AWS secret access key
AWS_SECRET_ACCESS_KEY='aws-secret-access-key'

# AWS region where the bucket will be located
AWS_BUCKET_REGION='ap-south-1'

# AWS endpoint
AWS_BUCKET_ENDPOINT='s3.ap-south-1.amazonaws.com'

# AWS bucket name which stores files
DEFAULT_AWS_BUCKET_NAME='aws-bucket-storage-name'

# Azure storage account name
AZURE_ACCOUNT_NAME='account-name'

# Azure storage account key
AZURE_ACCOUNT_KEY='azure-account-key'

# Azure storage container which stores files
DEFAULT_AZURE_CONTAINER_NAME='azure-container-storage-name'

# User service host
USER_SERVICE_HOST='http://localhost:3001'

# User service base URL
USER_SERVICE_BASE_URL='/user/'

# Big blue button URL
BIG_BLUE_BUTTON_URL=https://dev.some.temp.org

# Big blue button base URL
BIB_BLUE_BUTTON_BASE_URL=/bigbluebutton/

# Meeting end callback events endpoint
MEETING_END_CALLBACK_EVENTS=https%3A%2F%2Fdev.some-apis.temp.org%2Fmentoring%2Fv1%2Fsessions%2Fcompleted

# Big blue button secret key
BIG_BLUE_BUTTON_SECRET_KEY=sa9d0f8asdg7a9s8d7f

# Big blue button recording ready callback URL
RECORDING_READY_CALLBACK_URL=http%3A%2F%2Flocalhost%3A3000%2F%3FmeetingID%3Dmeet123
BIG_BLUE_BUTTON_SECRET_KEY="s90df8g09sd8fg098sdfg"

# Enable logging of network requests
ENABLE_LOG=true

# API doc URL
API_DOC_URL='/api-doc'

# Internal cache expiry time
INTERNAL_CACHE_EXP_TIME=86400

# Redis Host connectivity URL
REDIS_HOST='redis://localhost:6379'

# Kafka internal communication
CLEAR_INTERNAL_CACHE='mentoringInternal'

# Enable email for reported issues
ENABLE_EMAIL_FOR_REPORT_ISSUE=true

# Email ID of the support team
SUPPORT_EMAIL_ID='support@xyz.com,team@xyz.com'

# Email template code for reported issues
REPORT_ISSUE_EMAIL_TEMPLATE_CODE='user_issue_reported'

BIG_BLUE_BUTTON_SESSION_END_URL='https%3A%2F%2Fdev.some-mentoring.temp.org%2F'

SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID="rakesh.k@some.com"
SCHEDULER_SERVICE_URL="http://localhost:4000/jobs/scheduleJob"
ERROR_LOG_LEVEL='silly'
DISABLE_LOG=false
DEFAULT_MEETING_SERVICE="BBB"
# BIG_BLUE_BUTTON_LAST_USER_TIMEOUT_MINUTES=15
SESSION_EDIT_WINDOW_MINUTES=0
SESSION_MENTEE_LIMIT=5
DEV_DATABASE_URL=postgres://shikshalokam:slpassword@localhost:9700/elevate_mentoring
MENTOR_SESSION_DELETE_EMAIL_TEMPLATE='mentor_session_delete'

SCHEDULER_SERVICE_HOST="http://localhost:4000"
SCHEDULER_SERVICE_BASE_URL= '/scheduler/'
DEFAULT_ORGANISATION_CODE="default_code"

REFRESH_VIEW_INTERVAL=30000
MENTEE_SESSION_ENROLLMENT_EMAIL_TEMPLATE=mentee_session_enrollment
DEFAULT_ORG_ID=1
```

Save and exit.

## Setting up Databases

**Log into the postgres user**

```bash
$ sudo su postgres
```

**Log into psql**

```bash
$ psql -p 9700
```

**Create a database user/role:**

```sql
CREATE USER shikshalokam WITH ENCRYPTED PASSWORD 'slpassword';
```

**Create the elevate_mentoring database**

```sql
CREATE DATABASE elevate_mentoring;
GRANT ALL PRIVILEGES ON DATABASE elevate_mentoring TO shikshalokam;
\c elevate_mentoring
GRANT ALL ON SCHEMA public TO shikshalokam;
```

## Running Migrations To Create Tables

**Exit the postgres user account and install sequelize-cli globally**

```bash
$ sudo npm i sequelize-cli -g
```

**Navigate to the src folder of mentoring service and run sequelize-cli migration command:**

```bash
mentoring/src$ npx sequelize-cli db:migrate
```

**Now all the tables must be available in the Citus databases**

## Setting up Distribution Columns in Citus PostgreSQL Database

Refer [Choosing Distribution Column](https://docs.citusdata.com/en/stable/sharding/data_modeling.html) for more information regarding Citus distribution columns.

**Login into the postgres user**

```bash
$ sudo su postgres
```

**Login to psql**

```bash
$ psql -p 9700
```

**Login to the elevate_mentoring database**

```sql
\c elevate_mentoring
```

**Enable Citus for elevate_mentoring**

```sql
CREATE EXTENSION citus;
```

**Within elevate_mentoring, run the following queries:**

```sql
SELECT create_distributed_table('entities', 'entity_type_id');
SELECT create_distributed_table('entity_types', 'organization_id');
SELECT create_distributed_table('feedbacks', 'user_id');
SELECT create_distributed_table('forms', 'organization_id');
SELECT create_distributed_table('issues', 'id');
SELECT create_distributed_table('mentor_extensions', 'user_id');
SELECT create_distributed_table('notification_templates', 'organization_id');
SELECT create_distributed_table('organization_extension', 'organization_id');
SELECT create_distributed_table('post_session_details', 'session_id');
SELECT create_distributed_table('questions', 'id');
SELECT create_distributed_table('question_sets', 'code');
SELECT create_distributed_table('session_attendees', 'session_id');
SELECT create_distributed_table('session_enrollments', 'mentee_id');
SELECT create_distributed_table('session_ownerships', 'mentor_id');
SELECT create_distributed_table('sessions', 'id');
SELECT create_distributed_table('user_extensions', 'user_id');
```

## Running Seeder to Populate the Tables with Seed Data

**Exit the postgres user navigate to the src folder of the mentoring service and update the .env file with these variables:**

```bash
mentoring/src$ nano /opt/backend/mentoring/src/.env
```

```env
DEFAULT_ORG_ID=<id generated by the insertDefaultOrg script>
DEFAULT_ORGANISATION_CODE=default_code
```

**Run the seeder command**

```bash
mentoring/src$ npm run db:seed:all
```

## Start the Service

Run pm2 start command:

```bash
mentoring/src$ pm2 start app.js -i 2 --name elevate-mentoring
```

#### Run pm2 ls command

```bash
$ pm2 ls
```

Output should look like this (Sample output, might slightly differ in your installation):

```bash
┌────┬─────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 23 │ elevate-mentoring       │ default     │ 1.0.0   │ cluster │ 90643    │ 46h    │ 0    │ online    │ 0%       │ 171.0mb  │ jenkins  │ disabled │
│ 24 │ elevate-mentoring       │ default     │ 1.0.0   │ cluster │ 90653    │ 46h    │ 0    │ online    │ 0%       │ 168.9mb  │ jenkins  │ disabled │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

This concludes the services and dependency setup.

## Postman Collections

-   [Mentoring Service](https://github.com/ELEVATE-Project/mentoring/tree/develop-2.5/src/api-doc)

</details>

</br>

**BigBlueButton™ Service (Optional) can be setup using the following method:**

<details><summary>Setting up the BigBlueButton Service (Optional)</summary>

## Setting up the BigBlueButton Service (Optional)

## Installation

**Expectation**: Integrate the BigBlueButton meeting platform with the mentoring application.

1. Before installing, ensure that you meet all the prerequisites required to install BigBlueButton. To learn more, see Administration section in [BigBlueButton Docs](https://docs.bigbluebutton.org).

2. Install BigBlueButton version 2.6 using the hostname and email address, which you want to use. To learn more, see Administration section in [BigBlueButton Docs](https://docs.bigbluebutton.org).

3. After completing the installation, check the status of your server using the following command:

    ```
    sudo bbb-conf --check
    ```

    > **Note**: If you encounter any error which is flagged as _Potential problems_, check for installation or configuration errors on your server.

4. Start the service using the following command:

    ```
    sudo bbb-conf --start
    ```

5. Check if the BigBlueButton service is running using the following command:

    ```
    sudo bbb-conf --status
    ```

6. Restart the BigBlueButton server using the following command:

    ```
    sudo bbb-conf --restart
    ```

## Obtaining the Secret Key

If you wish to generate a new secret key, use the following command:

```
sudo bbb-conf --secret
```

## Deleting the Demo Meeting

If you want to delete the demo meeting, use the following command:

```
sudo apt-get purge bbb-demo
```

> **Tip**:
>
> -   To learn more, see the Administration section in <a href="https://docs.bigbluebutton.org">BigBlueButton Docs</a>.
> -   To automatically delete the metadata of recordings which are converted to mp4 format and uploaded on the cloud storage, see <a href="https://github.com/ELEVATE-Project/elevate-utils/tree/master/BBB-Recordings">ELEVATE-Project on GitHub</a>.

</details>

</br>

# Postman Collections

-   [Mentoring Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)
-   [User Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)
-   [Notification Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)
-   [Scheduler Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)

# Dependencies

This project relies on the following services:

-   [User Service](https://github.com/ELEVATE-Project/user)
-   [Notification Service](https://github.com/ELEVATE-Project/notification)
-   [Scheduler Service](https://github.com/ELEVATE-Project/scheduler)
-   [Interface Service](https://github.com/ELEVATE-Project/interface-service)

Please follow the setup guide provided with each service to ensure proper configuration. While these are the recommended services, feel free to utilize any alternative microservices that better suit your project's requirements.

For a comprehensive overview of the MentorEd implementation, refer to the [MentorEd Documentation](https://elevate-docs.shikshalokam.org/.mentorEd/intro).

The source code for the frontend/mobile application can be found in its respective [GitHub repository](https://github.com/ELEVATE-Project/mentoring-mobile-app). -->

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

<!-- ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![CircleCI](https://img.shields.io/badge/circle%20ci-%23161616.svg?style=for-the-badge&logo=circleci&logoColor=white) -->
