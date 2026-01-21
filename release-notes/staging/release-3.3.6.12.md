# 🚀 Project-Service Release 3.3.6.12

## 🐞 Bug Fixes

-   **3881** – Case Sensitivity in Program Manager Mapping – Fixed issue where ADD and REMOVE operations were treated as case-sensitive in Program Manager mapping.
-   **3878** – Invalid Operation Handling – Resolved bug where invalid operation names in Program Manager mapping were returning a 200 success response instead of an error.
-   **3874** – Invalid Program/Manager Mapping – Fixed issue where non-existent Programs or Program Managers were being mapped to an organization with a success message.
-   **3626** – Solution Creation with Org ID – Resolved failure in Solution creation via SUP when the Org ID was provided in uppercase or camelCase.
