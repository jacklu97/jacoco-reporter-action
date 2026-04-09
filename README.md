# jacoco-reporter-action

Github action that will publish the result of JaCoCo report as a PR comment. This is helpful to make sure your changes are properly tested and code coverage stays in an acceptable range.

## Usage

Create a workflow inside your github directory (`.github/workflows`). An example workflow is available below. If you need assistance creating a workflow, take a look at the official documentation regarding [github actions and workflows](https://docs.github.com/en/actions/get-started/quickstart).

### Inputs

| Name            | Description                      | Default value                 | Mandatory |
| --------------- | -------------------------------- | ----------------------------- | --------- |
| github-token    | Token generated per PR execution | N/A                           | No        |
| jacoco-xml-path | Path to jacoco.xml file          | target/site/jacoco/jacoco.xml | No        |

### Outputs

- `line-coverage`: Line coverage percentage
- `branch-coverage`: Branch coverage percentage
- `method-coverage`: Method coverage percentage

## Example workflow

```yml
name: Build check

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: "21"
          distribution: "temurin"
          cache: maven

      - name: Build with Maven
        run: mvn -B package --file pom.xml

      - name: Jacoco coverage check
        uses: jacklu97/jacoco-reporter-action@v1.0.0
```

⚠️ Note that it is required to enable jacoco in your pom file for this to action to properly work

## Possible outcomes

### Success

![alt text](img/success_outcome.png)

### No jacoco file found

![alt text](img/no_jacoco_outcome.png)

## Licence

The scripts and documentation in this project are released under the [MIT licence](./LICENSE)
