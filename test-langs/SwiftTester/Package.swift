// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "SwiftTester",
    products: [
        .executable(name: "tester", targets: ["SwiftTester"]),
    ],
    dependencies: [
        .package(url: "https://github.com/adraffy/ENSNormalize.swift.git", branch: "main")
    ],
    targets: [
        .executableTarget(
            name: "SwiftTester",
            dependencies: [
                .product(name: "ENSNormalize", package: "ENSNormalize.swift")
            ]
        )
    ]
)