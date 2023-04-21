package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed all:frontend/dist
var staticDir embed.FS

func main() {
	app := pocketbase.New()

	ui, err := fs.Sub(staticDir, "frontend/dist/frontend")
	if err != nil {
		log.Fatalln(err)
	}

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(ui, true))
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
