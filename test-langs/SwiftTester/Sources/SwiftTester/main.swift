import ENSNormalize
import Foundation

typealias Rec = [String: String]

var recs: [Rec] = []
let names = try JSONDecoder().decode(
    [String].self,
    from: try Data(
        contentsOf: URL(fileURLWithPath: "../../ens-labels/labels.json")
    )
)
print("Names: \(names.count)")

for name in names {
    var rec: Rec = [:]
    do {
        let norm = try name.ensNormalized()
        if norm != name {
            rec["norm"] = norm
        }
    } catch {
        rec["error"] = error.localizedDescription
    }
    recs.append(rec)
}

let data = try JSONEncoder().encode(recs)
try data.write(to: URL(fileURLWithPath: "../output/swift.json"))
