# Python Guidelines

This is a set of rules for AI assistants generating code for this project. Adherence to these guidelines is mandatory to ensure all contributions meet our standards for dependency management, code quality, and style.

### Core Principles
*   **Dependencies**: Handled exclusively by `poetry`.
*   **Tasks**: Run exclusively with `poe`.
*   **Typing**: All code must be fully and strictly type-hinted.
*   **Never** suggest using `pip` or `venv` directly.

### Dependency Management

*   **To add a production dependency**, instruct the user to run:
    ```bash
    poetry add <package-name>
    ```
*   **To add a development dependency** (e.g., for testing), instruct the user to run:
    ```bash
    poetry add --group dev <package-name>
    ```

### Code Generation (CRITICAL)
*   **Mandatory Type Hints**: All Python code you generate **must** be fully type-hinted. This is a non-negotiable project rule.
*   **Function Signatures**: All arguments and return values must have explicit type annotations.
    *   **Correct**: `def get_user(user_id: int) -> User | None:`
    *   **Incorrect**: `def get_user(user_id):`
*   **Modern Types**: Prefer modern type hints like `list[str]` over `typing.List[str]`.
*   **AVOID** using docstring when defining functions as it's against clean code principles.

### Task Execution & Quality Checks

All project tasks are run with `poe {task_name}`.

*   `poe test`: Runs the entire test suite.
  * `poe test <file/module>`: you can run a file/test by passing an argument (it will be passed to the pytest command) 
*   `poe mypy`: Performs strict static type checking.
*   `poe lint`: Checks the code for style issues and errors.
*   `poe format`: Automatically applies all required formatting fixes.
*   `poe format:unsafe`: Automatically applies all **UNSAFE** formatting fixes.

### After Every Change

**This is the most important rule.** After you generate or modify any code, you **must** validate the changes immediately by running the full quality suite.

```bash
poe format
poe mypy
```
