package main

import (
	"fmt"
	"encoding/json"
	"io"
	"os"

	"github.com/adraffy/go-ens-normalize/ensip15"
)

func main() {

	fmt.Println(ensip15.Shared().NF().UnicodeVersion())

	ensip15 := ensip15.New()
	file, err := os.Open("../../ens-labels/labels.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()
	data, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}
	var labels []string
	err = json.Unmarshal(data, &labels)
	if err != nil {
		panic(err)
	}
	var results []map[string]interface{}
	for _, label := range labels {
		norm, err := ensip15.Normalize(label)
		if err != nil {
			results = append(results, map[string]interface{}{"error": err.Error()})
		} else if (norm == label) {
			results = append(results, map[string]interface{}{})
		} else {
			results = append(results, map[string]interface{}{"norm": norm})
		}
	}
	data, err = json.MarshalIndent(results, "", "")
	if err != nil {
		panic(err)
	}
	file, err = os.Create("../output/go.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write(data)
	if err != nil {
		panic(err)
	}
}
