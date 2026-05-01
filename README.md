# taxpadi

**taxpadi** is a Java-based utility for tracking and logging session activity, helping you answer the question *"where am I?"* within your application flow at any point in time.

## Features

- Session state logging and tracking
- Lightweight, dependency-free Java library
- Easy integration into existing Java projects

## Getting Started

### Prerequisites

- Java 11 or higher
- A Java build tool such as Maven or Gradle

### Building

```bash
mvn clean install
```

### Usage

```java
SessionLogger logger = new SessionLogger();
logger.log("Starting process X");
System.out.println(logger.whereAmI()); // prints the current session context
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)