<div align="center">

# Project Service

<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
  />
</a>

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/mentoring/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/mentoring/tree/master)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=duplicated_lines_density&branch=master)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![Docs](https://img.shields.io/badge/Docs-success-informational)](https://elevate-docs.shikshalokam.org/mentorEd/intro)

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring?filename=src%2Fpackage.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<details><summary>CircleCI insights</summary>

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/ELEVATE-Project/mentoring/master/buil-and-test/badge.svg?window=30d)](https://app.circleci.com/insights/github/ELEVATE-Project/mentoring/workflows/buil-and-test/overview?branch=integration-testing&reporting-window=last-30-days&insights-snapshot=true)

</details>

<details><summary>develop</summary>

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/mentoring/tree/develop.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/mentoring/tree/develop)
![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring/develop?filename=src%2Fpackage.json)

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/ELEVATE-Project/mentoring/dev/buil-and-test/badge.svg?window=30d)](https://app.circleci.com/insights/github/ELEVATE-Project/mentoring/workflows/buil-and-test/overview?branch=develop&reporting-window=last-30-days&insights-snapshot=true)

[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=duplicated_lines_density&branch=develop)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=coverage&branch=develop)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=vulnerabilities&branch=develop)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)

</details>

</br>
The Project building block enables creation, consumption of micro-improvement projects

</div>

# System Requirements

-   **Operating System:** Ubuntu 22/Windows 11/macos 12
-   **Node.js®:** v20
-   **PostgreSQL:** 16
-   **Apache Kafka®:** 3.5.0
-   **MongoDB:** 4.1.4

# Setup Options

**Elevate services can be setup in local using two methods:**

<details><summary>Dockerized Services & Dependencies Using Docker-Compose File</summary>

## Dockerized Services & Dependencies

Expectation: Upon following the prescribed steps, you will achieve a fully operational Project application setup, complete with both the portal and backend services.

## Prerequisites

To set up the Project application, ensure you have Docker and Docker Compose installed on your system. For Ubuntu users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). For Windows and MacOS users, you can refer to the Docker documentation for installation instructions: [Docker Compose Installation Guide](https://docs.docker.com/compose/install/). Once these prerequisites are in place, you're all set to get started with setting up the Project application.

## Installation

1.  **Create project Directory:** Create a directory named **project**.

    > Example Command: `mkdir project && cd project/`

2.  **Download Docker Compose File:** Retrieve the **[docker-compose-project.yml](https://github.com/ELEVATE-Project/mentoring/blob/readMe-test/src/scripts/setup/docker-compose-mentoring.yml)** file from the Project service repository and save it to the project directory.

    ```
    curl -OJL https://github.com/ELEVATE-Project/project-service/raw/readMe-test/documentation/1.0.0/dockerized/docker-compose-project.yml
    ```

    > Note: All commands are run from the project directory.

    Directory structure:

    ```
    ./project
    └── docker-compose-project.yml
    ```

3.  **Download Environment Files**: Using the OS specific commands given below, download environment files for all the services.

    -   **Ubuntu/Linux/Mac**
        ```
        curl -L \
         -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/interface_env \
         -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/project_env \
         -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/notification_env \
         -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/scheduler_env \
         -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/user_env \
         -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/environment.ts
        ```
    -   **Windows**

        ```
        curl -L ^
        -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/interface_env \
        -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/project_env \
        -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/notification_env \
        -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/scheduler_env \
        -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/user_env \
        -O https://github.com/ELEVATE-Project/project-service/raw/master/documentation/1.0.0/dockerized/envs/environment.ts
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/project-service/blob/master/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), and [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

    <!-- Basic dummychanges done  till here -->

4.  **Download `replace_volume_path` Script File**

    -   **Ubuntu/Linux/Mac**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/mac-linux/replace_volume_path.sh
        ```

    -   **Windows**

        ```
        curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/windows/replace_volume_path.bat
        ```

5.  **Run `replace_volume_path` Script File**

    -   **Ubuntu/Linux/Mac**
        1. Make the `replace_volume_path.sh` file an executable.
            ```
            chmod +x replace_volume_path.sh
            ```
        2. Run the script file using the following command.
            ```
            ./replace_volume_path.sh
            ```
    -   **Windows**

        Run the script file either by double clicking it or by executing the following command from the terminal.

        ```
        replace_volume_path.bat
        ```

        > **Note**: The provided script file replaces the host path for the **portal** service container volume in the `docker-compose-mentoring.yml` file with your current directory path.
        >
        > volumes:
        >
        > \- /home/joffin/elevate/backend/environment.ts:/app/src/environments/environment.ts

6.  **Download `docker-compose-up` & `docker-compose-down` Script Files**

    -   **Ubuntu/Linux/Mac**

        1. Download the files.

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/mac-linux/docker-compose-up.sh
            ```

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/mac-linux/docker-compose-down.sh
            ```

        2. Make the files executable by running the following commands.

            ```
            chmod +x docker-compose-up.sh
            ```

            ```
            chmod +x docker-compose-down.sh
            ```

    -   **Windows**

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/windows/docker-compose-up.bat
        ```

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/windows/docker-compose-down.bat
        ```

7.  **Run All Services & Dependencies:** All services and dependencies can be started using the `docker-compose-up` script file.

    -   **Ubuntu/Linux/Mac**
        ```
        ./docker-compose-up.sh
        ```
    -   **Windows**

        ```
        docker-compose-up.bat
        ```

        > Double-click the file or run the above command from the terminal.

        > **Note**: During the first Docker Compose run, the database, migration seeder files, and the script to set the default organization will be executed automatically.

8.  **Access The MentorEd Application**: Once the services are up and the front-end app bundle is built successfully, navigate to **[localhost:8100](http://localhost:8100/)** to access the MentorEd app.
9.  **Gracefully Stop All Services & Dependencies:** All containers which are part of the docker-compose can be gracefully stopped by pressing `Ctrl + c` in the same terminal where the services are running.
10. **Remove All Service & Dependency Containers**: All docker containers can be stopped and removed by using the `docker-compose-down` file.

    -   **Ubuntu/Linux/Mac**
        ```
        ./docker-compose-down.sh
        ```
    -   **Windows**

        ```
        docker-compose-down.bat
        ```

        > **Caution**: As per the default configuration in the `docker-compose-mentoring.yml` file, using the `down` command will lead to data loss since the database container does not persist data. To persist data across `down` commands and subsequent container removals, refer to the "Persistence of Database Data in Docker Containers" section of this documentation.

## Enable Citus Extension

MentorEd relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

For more information, refer **[Citus Data](https://www.citusdata.com/)**.

To enable the Citus extension for mentoring and user services, follow these steps.

1. Create a sub-directory named `mentoring` and download `distributionColumns.sql` into it.
    ```
    mkdir mentoring && curl -o ./mentoring/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/distribution-columns/mentoring/distributionColumns.sql
    ```
2. Create a sub-directory named `user` and download `distributionColumns.sql` into it.
    ```
    mkdir user && curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/distribution-columns/user/distributionColumns.sql
    ```
3. Set up the citus_setup file by following the steps given below.

    - **Ubuntu/Linux/Mac**

        1. Download the `citus_setup.sh` file.

            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/mac-linux/citus_setup.sh
            ```

        2. Make the setup file executable by running the following command.

            ```
            chmod +x citus_setup.sh
            ```

        3. Enable Citus and set distribution columns for `mentoring` database by running the `citus_setup.sh`with the following arguments.
            ```
            ./citus_setup.sh mentoring postgres://postgres:postgres@citus_master:5432/mentoring
            ```
        4. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.
            ```
            ./citus_setup.sh user postgres://postgres:postgres@citus_master:5432/user
            ```

    - **Windows**
        1. Download the `citus_setup.bat` file.
            ```
             curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/dockerized/scripts/windows/citus_setup.bat
            ```
        2. Enable Citus and set distribution columns for `mentoring` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat mentoring postgres://postgres:postgres@citus_master:5432/mentoring
            ```
        3. Enable Citus and set distribution columns for `user` database by running the `citus_setup.bat`with the following arguments.
            ```
            citus_setup.bat user postgres://postgres:postgres@citus_master:5432/user
            ```
            > **Note:** Since the `citus_setup.bat` file requires arguments, it must be run from a terminal.

## Persistence Of Database Data In Docker Container

To ensure the persistence of database data when running `docker compose down`, it is necessary to modify the `docker-compose-mentoring.yml` file according to the steps given below:

1. **Modification Of The `docker-compose-mentoring.yml` File:**

    Begin by opening the `docker-compose-mentoring.yml` file. Locate the section pertaining to the Citus container and proceed to uncomment the volume specification. This action is demonstrated in the snippet provided below:

    ```yaml
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
    ```

By implementing these adjustments, the configuration ensures that when the `docker-compose down` command is executed, the database data is securely stored within the specified volumes. Consequently, this data will be retained and remain accessible, even after the containers are terminated and subsequently reinstated using the `docker-compose up` command.

## Sample User Accounts Generation

During the initial setup of MentorEd services with the default configuration, you may encounter issues creating new accounts through the regular SignUp flow on the MentorEd portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the MentorEd services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

1. **Download The `sampleData.sql` Files:**

    - **Ubuntu/Linux/Mac**

        ```
        mkdir -p sample-data/mentoring sample-data/user && \
        curl -L https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/mac-linux/mentoring/sampleData.sql -o sample-data/mentoring/sampleData.sql && \
        curl -L https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/mac-linux/user/sampleData.sql -o sample-data/user/sampleData.sql
        ```

    - **Windows**

        ```
        mkdir sample-data\mentoring 2>nul & mkdir sample-data\user 2>nul & ^
        curl -L "https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/windows/mentoring/sampleData.sql" -o sample-data\mentoring\sampleData.sql & ^
        curl -L "https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/sample-data/windows/user/sampleData.sql" -o sample-data\user\sampleData.sql
        ```

2. **Download The `insert_sample_data` Script File:**

    - **Ubuntu/Linux/Mac**

        ```
        curl -L -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/mac-linux/insert_sample_data.sh && chmod +x insert_sample_data.sh
        ```

    - **Windows**

        ```
        curl -L -o insert_sample_data.bat https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/dockerized/scripts/windows/insert_sample_data.bat
        ```

3. **Run The `insert_sample_data` Script File:**

    - **Ubuntu/Linux/Mac**

        ```
        ./insert_sample_data.sh user postgres://postgres:postgres@citus_master:5432/user && \
        ./insert_sample_data.sh mentoring postgres://postgres:postgres@citus_master:5432/mentoring
        ```

    - **Windows**

        ```
        insert_sample_data.bat user postgres://postgres:postgres@citus_master:5432/user & ^
        insert_sample_data.bat mentoring postgres://postgres:postgres@citus_master:5432/mentoring
        ```

    After successfully running the script mentioned above, the following user accounts will be created and available for login:

    | Email ID                 | Password   | Role               |
    | ------------------------ | ---------- | ------------------ |
    | aaravpatel@example.com   | Password1@ | Mentee             |
    | arunimareddy@example.com | Password1@ | Mentor             |
    | aaravpatel@example.com   | Password1@ | Organization Admin |

</details>

<details>
<summary>Natively Installed Services & Dependencies </summary>

## PM2 Managed Services & Natively Installed Dependencies

Expectation: Upon following the prescribed steps, you will achieve a fully operational ELEVATE-Project application setup. Both the portal and backend services are managed using PM2, with all dependencies installed natively on the host system.

## Prerequisites

Before setting up the following ELEVATE-Project application, dependencies given below should be installed and verified to be running. Refer to the steps given below to install them and verify.

-   **Ubuntu/Linux**

    1. Download dependency management scripts:
        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/check-dependencies.sh && \
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/install-dependencies.sh && \
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/uninstall-dependencies.sh && \
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

<!-- -   **MacOS**

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

    6. Download `check-dependencies.sh` file:

        ```
        curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/macos/check-dependencies.sh && \
        chmod +x check-dependencies.sh
        ```

    7. Verify installed dependencies by running `check-dependencies.sh`:

        ```
        ./check-dependencies.sh
        ``` -->

<!-- -   **Windows**

    1. Install Node.js 20:

        Download and install Node.js v20 for Windows platform (x64) from official [Node.js download page](https://nodejs.org/en/download).

    2. Install Kafka 3.5.0:

        1. Adapt the instructions given in the following ["Apache Kafka on Windows"](https://www.conduktor.io/kafka/how-to-install-apache-kafka-on-windows/) documentation to install Kafka version 3.5.0.

            > Note: As per the instructions, Kafka server and Zookeeper has to be kept active on different WSL terminals for the entire lifetime of MentorEd services.

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

        2. Once installed, Add `C:\Program Files\PostgreSQL\16\bin` to windows environment variables. Refer [here](https://www.computerhope.com/issues/ch000549.htm) or [here](https://stackoverflow.com/a/68851621) for more information regarding how to set it. -->

## Installation

1. **Create ELEVATE-Project Directory:** Create a directory named **ELEVATE-Project**.

    > Example Command: `mkdir ELEVATE-Project && cd ELEVATE-Project/`

2. **Git Clone Services And Portal Repositories**

    - **Ubuntu/Linux/MacOS**

        ```
        git clone -b main https://github.com/ELEVATE-Project/project-service.git && \
        git clone -b main https://github.com/ELEVATE-Project/entity-management.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/user.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/notification.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/interface-service.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/scheduler.git && \
        git clone -b release-2.6.1 https://github.com/ELEVATE-Project/mentoring-mobile-app.git
        ```

3. **Install NPM Packages**

    - **Ubuntu/Linux/MacOS**

        ```
        cd project-service && npm install && cd ../ && \
        cd entity-management/src && npm install && cd ../.. && \
        cd user/src && npm install && cd ../.. && \
        cd notification/src && npm install && cd ../.. && \
        cd interface-service/src && npm install && cd ../.. && \
        cd scheduler/src && npm install && cd ../.. && \
        cd mentoring-mobile-app && npm install --force && cd ..
        ```

4. **Download Environment Files**

    - **Ubuntu/Linux**

        ```
        curl -L -o mentoring/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/mentoring_env && \
        curl -L -o user/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/user_env && \
        curl -L -o notification/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/notification_env && \
        curl -L -o interface-service/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/interface_env && \
        curl -L -o scheduler/src/.env https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/scheduler_env && \
        curl -L -o mentoring-mobile-app/src/environments/environment.ts https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/envs/environment.ts
        ```

    > **Note:** Modify the environment files as necessary for your deployment using any text editor, ensuring that the values are appropriate for your environment. The default values provided in the current files are functional and serve as a good starting point. Refer to the sample env files provided at the [Project](https://github.com/ELEVATE-Project/mentoring/blob/master/src/.env.sample), [User](https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample), [Notification](https://github.com/ELEVATE-Project/notification/blob/master/src/.env.sample), [Scheduler](https://github.com/ELEVATE-Project/scheduler/blob/master/src/.env.sample), [Interface](https://github.com/ELEVATE-Project/interface-service/blob/main/src/.env.sample) and [Entity-Management]() repositories for reference.

    > **Caution:** While the default values in the downloaded environment files enable the ELEVATE-Project Application to operate, certain features may not function correctly or could be impaired unless the adopter-specific environment variables are properly configured.

    > **Important:** As mentioned in the above linked document, the **User SignUp** functionality may be compromised if key environment variables are not set correctly during deployment. If you opt to skip this setup, consider using the sample user account generator detailed in the `Sample User Accounts Generation` section of this document.

5. **Create Databases**

    - **Ubuntu/Linux**
        1. Download `create-databases.sh` Script File:
            ```
            curl -OJL https://github.com/ELEVATE-Project/mentoring/raw/master/documentation/2.6.1/native/scripts/linux/create-databases.sh
            ```
        2. Make the executable by running the following command:
            ```
            chmod +x create-databases.sh
            ```
        3. Run the script file:
            ```
            ./create-databases.sh
            ```

6. **Run Migrations To Create Tables**

    - **Ubuntu/Linux/MacOS**

        1. Install Sequelize-cli globally:
            ```
            sudo npm i sequelize-cli -g
            ```
        2. Run Migrations:
            ```
            cd user/src && npx sequelize-cli db:migrate && cd ../.. && \
            cd notification/src && npx sequelize-cli db:migrate && cd ../..
            ```

7. **Insert Initial Data**
   Use ELEVATE-Project scripts to insert the initial data.

    - **Ubuntu/Linux/MacOS**

        ```
        cd ELEVATE-Project/project-service/documentation/1.0.0/native/scripts/linux && \
        sh entity-project-sample-data.sh && \
        cd ~/ELEVATE-Project/ && \
        cd user/src && npm run db:seed:all && cd ../..
        ```

8. **Start The Services**

    Following the steps given below, 2 instances of each ELEVATE-Project backend service will be deployed and be managed by PM2 process manager.

    - **Ubuntu/Linux**

        ```
        cd project-service && pm2 start app.js -i 2 --name project-service && cd .. && \
        cd entity-management/src && pm2 start app.js -i 2 --name entity-management && cd ../.. && \
        cd user/src && pm2 start app.js -i 2 --name user && cd ../.. && \
        cd notification/src && pm2 start app.js -i 2 --name notification && cd ../.. && \
        cd interface-service/src && pm2 start app.js -i 2 --name interface && cd ../.. && \
        cd scheduler/src && pm2 start app.js -i 2 --name scheduler && cd ../..
        ```

9. **Run Service Scripts**

    - **Ubuntu/Linux/MacOS**

        ```
        cd user/src/scripts && node insertDefaultOrg.js && node viewsScript.js && \
        node -r module-alias/register uploadSampleCSV.js && cd ../../..
        ```

10. **Start The Portal**

    MentorEd portal utilizes Ionic and Angular CLI for building the browser bundle, follow the steps given below to install them and start the portal.

    - **Ubuntu/Linux**

        1. Install Ionic CLI globally:

            ```
            sudo npm install -g @ionic/cli
            ```

        2. Install Angular CLI globally:

            ```
            sudo npm install -g @angular/cli
            ```

        3. Navigate to `mentoring-mobile-app` directory:

            ```
            cd mentoring-mobile-app
            ```

        4. Build the portal

            ```
            ionic build
            ```

        5. Start the portal:
            ```
            pm2 start pm2.config.json && cd ..
            ```

    Navigate to http://localhost:7601 to access the MentorEd Portal.

## Sample User Accounts Generation

During the initial setup of ELEVATE-Project services with the default configuration, you may encounter issues creating new accounts through the regular SignUp flow on the ELEVATE-Project portal. This typically occurs because the default SignUp process includes OTP verification to prevent abuse. Until the notification service is configured correctly to send actual emails, you will not be able to create new accounts.

In such cases, you can generate sample user accounts using the steps below. This allows you to explore the ELEVATE-Project services and portal immediately after setup.

> **Warning:** Use this generator only immediately after the initial system setup and before any normal user accounts are created through the portal. It should not be used under any circumstances thereafter.

-   **Ubuntu/Linux**

    ```
    curl -o insert_sample_data.sh https://raw.githubusercontent.com/ELEVATE-Project/mentoring/master/documentation/2.6.1/native/scripts/linux/insert_sample_data.sh && \
    chmod +x insert_sample_data.sh && \
    ./insert_sample_data.sh
    ```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID                 | Password   | Role               |
| ------------------------ | ---------- | ------------------ |
| aaravpatel@example.com   | Password1@ | Mentee             |
| arunimareddy@example.com | Password1@ | Mentor             |
| devikasingh@example.com  | Password1@ | Organization Admin |

</details>

    ```sql
    postgres=# select citus_version();
                                           citus_version
    ----------------------------------------------------------------------------------------------------
     Citus 12.1.1 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 9.4.0-1ubuntu1~20.04.2) 9.4.0, 64-bit
    (1 row)
    ```

### Install PM2

Refer to [How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04).

**Exit the postgres user account and run the following command**

```bash
$ sudo npm install pm2@latest -g
```

## Setting up Repositories

### Clone the project-service repository to /opt/backend directory

```bash
opt/backend$ git clone -b main --single-branch "https://github.com/ELEVATE-Project/project-service.git"
```

### Install Npm packages from src directory

```bash
backend/project-service$ sudo npm i
```

</details>

### Create .env file in src directory

```bash
project-service$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

```env
# Project Service Env Config

# Port on which service runs
APPLICATION_PORT=5000

# Service environment
APPLICATION_ENV=development

# Mongo db connectivity URL
MONGODB_URL=mongodb://localhost:27017/elevate-project

# Token secret to verify the access token
ACCESS_TOKEN_SECRET='asadsd8as7df9as8df987asdf'

# Internal access token for communication between services via network call
INTERNAL_ACCESS_TOKEN='internal_access_token'

# Kafka hosted server URL
KAFKA_URL=localhost:9092

# Kafka group to which consumer belongs
KAFKA_GROUP_ID="projects"

# Kafka topic to push notification data
NOTIFICATION_KAFKA_TOPIC='develop.notifications'

# CLOUD_STORAGE_PROVIDER
CLOUD_STORAGE_PROVIDER=gcloud

# GCP bucket name which stores files
CLOUD_STORAGE_BUCKETNAME='gcp-bucket-storage-name'

# GCP project id
CLOUD_STORAGE_PROJECT='project-id'

# GCP storage account name
CLOUD_STORAGE_ACCOUNTNAME='gcp-storage-account-name'

# GCP cloud storage secret
CLOUD_STORAGE_SECRET='gcp-secret-key'

# GCP cloud storage bucket type
CLOUD_STORAGE_BUCKET_TYPE='public/private'

# User service base URL
USER_SERVICE_BASE_URL= "/user"

#Elevate project service url
ELEVATE_PROJECT_SERVICE_URL='http://localhost:5000'

# Validate entities
VALIDATE_ENTITIES="ON/OFF"

# Timezone difference
TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC= "+05:30"

# Project submission topic
PROJECT_SUBMISSION_TOPIC= "sl-improvement-project-submission-dev",

#Kafka communications
KAFKA_COMMUNICATIONS_ON_OFF="ON/OFF"

#Gotenberg Url
GOTENBERG_URL= "http://localhost:3000"

# Entity Management service base url
ENTITY_MANAGEMENT_SERVICE_BASE_URL= "/entity-management"

# Default org id
DEFAULT_ORG_ID=1
```

Save and exit.

## Setting up Databases

**Log into the mongoDB**

```bash
$ sudo su mongo --port 27017
```

**To create a user and database in MongoDB, run the following command in the MongoDB shell**

```
use admin;
db.createUser({user: "shikshalokam", pwd: "slpassword",
  roles: [
    { role: "readWrite", db: "elevate-project" },
    { role: "readWrite", db: "elevate-entity" }
  ]
});
```

## Running Script to Populate the Tables with Sample Data

**Exit the mongo user navigate to the root folder of the project service and update the .env file with these variables:**

```bash
project-service$ nano /opt/backend/project-service/.env
```

```env
DEFAULT_ORG_ID=<id generated by the insertDefaultOrg script>
DEFAULT_ORGANISATION_CODE=default_code
```

**Navigate to the script and execute the script**

```bash
sh /opt/backend/project-service/documentation/1.0.0/native/scripts/linux/entity-project-sample-data.sh
```

## Start the Service

Run pm2 start command:

```bash
project-service$ pm2 start app.js -i 2 --name elevate-projects
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
│ 23 │ elevate-projects        │ default     │ 1.0.0   │ cluster │ 90643    │ 46h    │ 0    │ online    │ 0%       │ 171.0mb  │ jenkins  │ disabled │
│ 24 │ elevate-projects        │ default     │ 1.0.0   │ cluster │ 90653    │ 46h    │ 0    │ online    │ 0%       │ 168.9mb  │ jenkins  │ disabled │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

This concludes the services and dependency setup.

</details>

</br>

# Postman Collections

-   [Project Service](https://github.com/ELEVATE-Project/project-service/tree/main/api-doc)
-   [User Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)
-   [Notification Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)
-   [Scheduler Service](https://github.com/ELEVATE-Project/mentoring/tree/master/documentation/latest/postman-collections/mentoring)
-   [Entity Management](https://github.com/ELEVATE-Project/entity-management/tree/main/src/api-doc)

# Dependencies

This project relies on the following services:

-   [Entity Management](https://github.com/ELEVATE-Project/entity-management.git)
-   [User Service](https://github.com/ELEVATE-Project/user)
-   [Notification Service](https://github.com/ELEVATE-Project/notification)
-   [Scheduler Service](https://github.com/ELEVATE-Project/scheduler)
-   [Interface Service](https://github.com/ELEVATE-Project/interface-service)

Please follow the setup guide provided with each service to ensure proper configuration. While these are the recommended services, feel free to utilize any alternative microservices that better suit your project's requirements.

<!-- For a comprehensive overview of the MentorEd implementation, refer to the [MentorEd Documentation](https://elevate-docs.shikshalokam.org/.mentorEd/intro). -->

The source code for the frontend/mobile application can be found in its respective [GitHub repository](https://github.com/ELEVATE-Project/mentoring-mobile-app).

# Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

# Open Source Dependencies

Several open source dependencies that have aided Mentoring's development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![Gotenberg](https://img.shields.io/badge/Gotenberg-%23007EC6.svg?style=for-the-badge&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

<!-- ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![CircleCI](https://img.shields.io/badge/circle%20ci-%23161616.svg?style=for-the-badge&logo=circleci&logoColor=white) -->
