<div align="center">

# project service
<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
  />
</a>

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring?filename=src%2Fpackage.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Projects service along with Elevate interface service and Elevate user service or any other user service  allows to create, track, and update tasks, subtasks, and upload evidence to manage and monitor improvements. 
</div>
</br>

# System Requirements

-   **Operating System:** Ubuntu 22
-   **Node.js®:** v20
-   **MongoDB:** Latest
-   **Apache Kafka®:** 3.5.0

# Setup Options

Elevate project-service services can be setup in local using two methods:

<details><summary>Dockerized service with local dependencies(Intermediate)</summary>

## A. Dockerized Service With Local Dependencies

**Expectation**: Run single docker containerized service with existing local (in host) or remote dependencies.

Coming soon...

</details>

<details><summary>Local Service with local dependencies(Hardest)</summary>

## B. Local Service With Local Dependencies

**Expectation**: Run single service with existing local dependencies in host (**Non-Docker Implementation**).

## Installations

### Install Node.js LTS

Refer to the [NodeSource distributions installation scripts](https://github.com/nodesource/distributions#installation-scripts) for Node.js installation.

```bash
$ curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

### Install Build Essential

```bash
$ sudo apt-get install build-essential
```
### Install MongoDB

Depending on your preference, you can either run it in Docker or set it up natively.

Running MongoDB in Docker
To run MongoDB in Docker, use the following command:

docker run -d --name mongodb -p 27017:27017 -v mongo_data:/data/db mongo:latest
This command will:

Run MongoDB in detached mode.
Name the container "mongodb."
Map port 27017 of the container to port 27017 on the host machine.
Use a Docker volume named mongo_data to persist MongoDB data.
For manual installation, please refer to the following link [MongoDB Installation Manual](https://www.mongodb.com/docs/manual/installation/).

### Install Kafka

Refer to [Kafka Ubuntu 22.04 setup guide](https://www.fosstechnix.com/install-apache-kafka-on-ubuntu-22-04-lts/)

1. Install OpenJDK 11:

    ```bash
    $ sudo apt install openjdk-11-jdk
    ```

2. Download and extract Kafka:

    ```bash
    $ sudo wget https://downloads.apache.org/kafka/3.5.0/kafka_2.12-3.5.0.tgz
    $ sudo tar xzf kafka_2.12-3.5.0.tgz
    $ sudo mv kafka_2.12-3.5.0 /opt/kafka
    ```

3. Configure Zookeeper:

    ```bash
    $ sudo nano /etc/systemd/system/zookeeper.service
    ```

    Paste the following lines into the `zookeeper.service` file:

    ```ini
    /etc/systemd/system/zookeeper.service
    [Unit]
    Description=Apache Zookeeper service
    Documentation=http://zookeeper.apache.org
    Requires=network.target remote-fs.target
    After=network.target remote-fs.target

    [Service]
    Type=simple
    ExecStart=/opt/kafka/bin/zookeeper-server-start.sh /opt/kafka/config/zookeeper.properties
    ExecStop=/opt/kafka/bin/zookeeper-server-stop.sh
    Restart=on-abnormal

    [Install]
    WantedBy=multi-user.target
    ```

    Save and exit.

4. Reload systemd:

    ```bash
    $ sudo systemctl daemon-reload
    ```

5. Configure Kafka:

    ```bash
    $ sudo nano /etc/systemd/system/kafka.service
    ```

    Paste the following lines into the `kafka.service` file:

    ```ini
    [Unit]
    Description=Apache Kafka Service
    Documentation=http://kafka.apache.org/documentation.html
    Requires=zookeeper.service

    [Service]
    Type=simple
    Environment="JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64"
    ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
    ExecStop=/opt/kafka/bin/kafka-server-stop.sh

    [Install]
    WantedBy=multi-user.target
    ```

    Save and exit.

6. Reload systemd:

    ```bash
    $ sudo systemctl daemon-reload
    ```

7. Start Zookeeper:

    ```bash
    $ sudo systemctl start zookeeper
    ```

    Check status:

    ```bash
    $ sudo systemctl status zookeeper
    ```

    Zookeeper service status should be shown as active (running).

8. Start Kafka:

    ```bash
    $ sudo systemctl start kafka
    ```

    Check status:

    ```bash
    $ sudo systemctl status kafka
    ```

    Kafka status should be shown as active (running).

### Install PM2

Refer to [How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04).

**Run the following command**

```bash
$ sudo npm install pm2@latest -g
```

## Setting up Repository

### Clone the mentoring repository to /opt/backend directory

```bash
opt/backend$ git clone -b develop --single-branch "https://github.com/ELEVATE-Project/project-service.git"
```

### Install Npm packages from src directory

```bash
backend/project-service/src$ sudo npm i
```

### Create .env file in src directory

```bash
project-service/src$ sudo nano .env
```

### Copy-paste the following env variables to the `.env` file:
NB: Make sure to update the credentials according to your configurations. To understand each keys we can refer this file : https://github.com/ELEVATE-Project/project-service/blob/develop/.env.sample


```env
API_DOC_URL= /elevate-interface/api-doc,
APPLICATION_ENV= development,
APPLICATION_PORT= 5004,
ENTITY_MANAGEMENT_SERVICE_BASE_URL= http://localhost:5002,
INSTALLED_PACKAGES= "elevate-user elevate-mentoring elevate-scheduler elevate-project elevate-entity-management elevate-self-creation-portal elevate-survey",
MENTORING_SERVICE_BASE_URL= http://localhost:7101,
NOTIFICATION_SERVICE_BASE_URL= http://localhost:7201,
PROJECT_SERVICE_BASE_URL= http://localhost:5003,
RATE_LIMITER_ENABLED= false,
RATE_LIMITER_GENERAL_LIMIT= 50,
RATE_LIMITER_NUMBER_OF_PROXIES= 3,
RATE_LIMITER_PUBLIC_LOW_LIMIT= 5,
REQUIRED_PACKAGES= "elevate-user@1.1.72 elevate-mentoring@1.1.47 elevate-scheduler@1.0.4 elevate-project@1.1.8 elevate-entity-management@1.0.7 elevate-self-creation-portal@1.0.19 elevate-survey@1.0.7",
SAMIKSHA_SERVICE_BASE_URL= http://localhost:5007,
SCHEDULER_SERVICE_BASE_URL= http://localhost:7401,
SELF_CREATION_PORTAL_SERVICE_BASE_URL= http://localhost:6001,
SUPPORTED_HTTP_TYPES= "GET POST PUT PATCH DELETE",
USER_SERVICE_BASE_URL= http://localhost:5001
```

## Start the Service

Navigate to the src folder of project service and run pm2 start command:

```bash
project-service/src$ pm2 start app.js -i 2 --name elevate-project
```

#### Run pm2 ls command

```bash
$ pm2 ls
```

Output should look like this (Sample output, might slightly differ in your installation):

```bash
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 4  │ elevate-project    │ cluster  │ 42   │ online    │ 0%       │ 55.3mb   │
│ 5  │ elevate-project    │ cluster  │ 41   │ online    │ 0%       │ 187.4mb  │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

This concludes the project service and dependency setup.

Save and exit.

</details>
<br>
# Dependencies

This project service relies on the following services:
-   [Interface Service](https://github.com/ELEVATE-Project/interface-service)
-   [User Service](https://github.com/ELEVATE-Project/user)
-   [Notification Service](https://github.com/ELEVATE-Project/notification)
-   [Scheduler Service](https://github.com/ELEVATE-Project/scheduler)
-   [Entity Management Service](https://github.com/ELEVATE-Project/entity-management)
-   Gotenberg Service

Please follow the setup guide provided with each service to ensure proper configuration. While these are the recommended services, feel free to utilize any alternative microservices that better suit your project's requirements.

To generate report PDFs project service utilizes gotenberg. This service can be easily setup using docker

```bash
docker run --rm -d -p 3000:3000 gotenberg/gotenberg:8
```
We can change the port  based on our configuration. But make sure that GOTENBERG_URL  env variable is provided accordingly to project-service

NB: There is a responsive PWA that works well on mobile, tab and desktop leveraging Elevate project-service which is compatible with the ELEVATE project user-service as well as notification-service is available at https://github.com/ELEVATE-Project/project-frontend

<!-- # Run tests

## Integration tests

```
npm run test:integration
```

To know more about integration tests and their implementation refer to the project [Wiki](https://github.com/ELEVATE-Project/user/wiki/Integration-and-Unit-testing).

## Unit tests

```
npm test
``` -->

# Team

<a href="https://github.com/ELEVATE-Project/project-service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/project-service" />
</a>

<br>

# Open Source Dependencies

Several open source dependencies that have aided Mentoring's development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
