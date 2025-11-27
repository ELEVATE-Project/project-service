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

## Supported Operating Systems

-   **Ubuntu (Recommended: Version 20 and above)**

## Dockerized Services & Dependencies

Expectation: By diligently following the outlined steps, you will successfully establish a fully operational Project application setup, including both the portal and backend services.

## Prerequisites

To set up the Project application, ensure you have Docker and Docker Compose installed on your system. For Ubuntu users, detailed installation instructions for both can be found in the documentation here: [How To Install and Use Docker Compose on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04). To install and use Nodejs in Ubuntu machine, you can follow instructions here: [How To Install Nodejs in Ubuntu](https://nodejs.org/en/download/package-manager).

## Installation

**Create project Directory:** Establish a directory titled **project**.

> Example Command: `mkdir project && cd project/`

> Note: All commands are run from the project directory.

## Operating Systems: Linux

> **Caution:** Before proceeding, please ensure that the ports given here are available and open. It is essential to verify their availability prior to moving forward. You can run below command in your terminal to check this

```
for port in 3000 3001 3002 6000 5001 4000 9092 5432 7007 2181 2707 3569 6001; do
    if lsof -iTCP:$port -sTCP:LISTEN &>/dev/null; then
        echo "Port $port is in use"
    else
        echo "Port $port is available"
    fi
done
```

1.  **Download and execute main setup script:** Execute the following command in your terminal from the project directory.
    ```
    curl -OJL https://raw.githubusercontent.com/ELEVATE-Project/project-service/refs/heads/setupGuideSCP/documentation/3.4.0/dockerized/scripts/scp/ubuntu/setup_project.sh && chmod +x setup_project.sh && sudo ./setup_project.sh
    ```

> Note : The script will download all the essential files and launch the services in Docker. Once all services are successfully up and running, you can proceed to the next steps.

> **General Instructions :**

1.  All containers which are part of the docker-compose can be gracefully stopped by pressing Ctrl + c in the same terminal where the services are running.

2.  All docker containers can be stopped and removed by using below command.

```
sudo ./docker-compose-down.sh
```

3.  All services and dependencies can be started using below command.

```
sudo ./docker-compose-up.sh
```

**Keep the current terminal session active, and kindly open a new terminal window within the project directory.**

**After successfully completing this, please move to the next section: [Enable Citus Extension](#enable-citus-extension-optional)**

## Enable Citus Extension (Optional)

User management service comes with this bundle relies on PostgreSQL as its core database system. To boost performance and scalability, users can opt to enable the Citus extension. This transforms PostgreSQL into a distributed database, spreading data across multiple nodes to handle large datasets more efficiently as demand grows.

For more information, refer **[Citus Data](https://www.citusdata.com/)**.

To enable the Citus extension for user services, follow these steps.

1. Create a sub-directory named `user` and download `distributionColumns.sql` into it. (Skip this for linux)
    ```
    mkdir user && curl -o ./user/distributionColumns.sql -JL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/3.4.0/distribution-columns/user/distributionColumns.sql
    ```
2. Create a sub-directory named `survey-project-creation` and download `distributionColumns.sql` into it. (Skip this for linux)
    ```
    mkdir survey-project-creation && curl -o ./survey-project-creation/distributionColumns.sql -JL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/3.4.0/distribution-columns/survey-project-creation/distributionColumns.sql
3. Set up the citus_setup file by following the steps given below.

    1. Enable Citus and set distribution columns for `user` database by running the `citus_setup.sh`with the following arguments.

    ```
    sudo ./citus_setup.sh user postgres://postgres:postgres@citus_master:5432/user
    ```
4. Set up the citus_setup file by following the steps given below.

    1. Enable Citus and set distribution columns for `survey-project-creation` database by running the `citus_setup.sh`with the following arguments.

    ```
    sudo ./citus_setup.sh survey-project-creation postgres://postgres:postgres@citus_master:5432/scp
    ```
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

```
sudo ./insert_sample_data.sh user postgres://postgres:postgres@citus_master:5432/user
```

After successfully running the script mentioned above, the following user accounts will be created and available for login:

| Email ID               | Password   | Role                    |
| ---------------------- | ---------- | ----------------------- |
| mallanagouda@gmail.com | Password1@ | State Education Officer |
| prajwal@gmail.com      | Password1@ | State Education Officer |
| vishnu@gmail.com       | Password1@ | State Education Officer |
| priyanka@gmail.com | Password1@ | Program Designer |
| adithya@gmail.com      | Password1@ | Content Creator |
| praveen@gmail.com       | Password1@ | Reviewer |

<!-- ## Sample Data Creation For Projects

This step will guide us in implementing a sample project solution following the initial setup of the project service.

1. **Insert Sample Data To Database:**

    ```
    node insert_sample_solutions.js
    ``` -->


## Default Forms Creation for Portal Configuration

This step inserts configuration forms into MongoDB, enabling or disabling features and fields on portal pages.

#### Insert Forms Data into Database

```
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/1.0.0/dockerized/scripts/mac-linux/import_forms_mongo.sh && chmod +x import_forms_mongo.sh && sudo ./import_forms_mongo.sh mongodb://mongo:27017/elevate-project
```

## Explore the Consumption Portal

Once the services are up and the front-end app bundle is built successfully, navigate to **[localhost:7007](http://localhost:7007/)** to access the Project app.

> **Warning:** In this setup, features such as **Sign-Up, Project Certificate, Project Sharing, and Project PDF Report** will not be available because cloud storage credentials have been masked in the environment files for security reasons.

## Default Forms Creation for Self Creation Portal Configuration

This step inserts configuration forms into postgres, enabling or disabling features and fields on portal pages.

#### Insert Forms Data into Database

```
curl -OJL https://github.com/ELEVATE-Project/project-service/raw/main/documentation/3.4.0/dockerized/scripts/scp/ubuntu/import_forms_postgres.sh && chmod +x import_forms_postgres.sh && sudo ./import_forms_postgres.sh postgres://postgres:postgres@citus_master:5432/scp
```

## Explore the Self Creation Portal

Once the services are up and the front-end app bundle is built successfully, navigate to **[localhost:1819](http://localhost:1819/)** to access the Creation app.

> **Warning:** In this setup, features such as **Sign-Up, Resource Creation** will not be available because cloud storage credentials have been masked in the environment files for security reasons. Before runs the docker compose file please update this with actual cloud credentials

## Postman Collections

-   [Projects Service](https://github.com/ELEVATE-Project/project-service/tree/main/api-doc)

-  [Surevy Project Creation Service](https://github.com/ELEVATE-Project/survey-project-creation-service/tree/release-1.0.0/src/api-doc)

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
