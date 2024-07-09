# Python scripts for elevate-project implementation

Python script to upload a program and add multiple resources like Projects and also upload multiple resources like task.

### Resource templates
- [Programs](https://docs.google.com/spreadsheets/d/1_pEomGIWxVZYwneQwY606zt26C72p9DU/edit?usp=drive_link&ouid=113799545932705393937&rtpof=true&sd=true)
- [Projects](https://docs.google.com/spreadsheets/d/11a9HxukXCX0_LPNZh9OVDeStUYwC0Pio/edit?usp=drive_link&ouid=113799545932705393937&rtpof=true&sd=true)

- Pull the code from latest release branch
- To clone the repository 
``` git clone -b latestBranch <git-link>```
- Navigate to Project-Service-implementation-Script folder 
``` PROJECT-SERVICE/Project-Service-implementation-Script/main.py```
- create a virtual environment in python.
``` python3 -m venv path/to/virtualEnv ```
- Once the virtual environment is created, activate the virtual environment.
In Linux
``` source { relative path to virtualEnv}/bin/activate ```
In Windows
``` { relative path to virtualEnv}/Scripts/activate ```
- Install all the dependencies using requirement.txt using following command. 
```  pip3 install -r requirement.txt ```
- Make sure there are no errors in the install.
- If there are any errors in the install, try to install the same version of the libraries seperatly.
- Download the user given template and save it in the same file where the code is hosted.
- There are TWO Command to run the script.
i. For programTemplate : 
- for QA
```  python3 main.py --env QA --programFile input.xlsx ```
-for DEV
```  python3 main.py --env dev --programFile input.xlsx ```
-for LOCAL
```  python3 main.py --env local --programFile input.xlsx ```
ii. For projectTemplate :
-for QA
```  python3 main.py --QA --project input.xlsx ```
-for DEV
```  python3 main.py --dev --project input.xlsx ```
-for LOCAL
```  python3 main.py --local --project input.xlsx ```
We have ``` dev ``` and ``` local ``` as environment.
