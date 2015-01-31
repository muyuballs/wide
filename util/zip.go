// Copyright (c) 2014-2015, b3log.org
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package util

import (
	"archive/zip"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
)

type myzip struct{}

// Zip utilities.
var Zip = myzip{}

// ZipFile represents a zip file.
type ZipFile struct {
	zipFile *os.File
	writer  *zip.Writer
}

// Create creates a zip file with the specified filename.
func (*myzip) Create(filename string) (*ZipFile, error) {
	file, err := os.Create(filename)
	if err != nil {
		return nil, err
	}

	return &ZipFile{zipFile: file, writer: zip.NewWriter(file)}, nil
}

// Close closes the zip file writer.
func (z *ZipFile) Close() error {
	err := z.writer.Close()
	if nil != err {
		return err
	}

	return z.zipFile.Close() // close the underlying writer
}

// AddEntryN adds entries.
func (z *ZipFile) AddEntryN(path string, names ...string) error {
	for _, name := range names {
		zipPath := filepath.Join(path, name)
		err := z.AddEntry(zipPath, name)
		if err != nil {
			return err
		}
	}
	return nil
}

// AddEntry adds a entry.
func (z *ZipFile) AddEntry(path, name string) error {
	fi, err := os.Stat(name)
	if err != nil {
		return err
	}

	fh, err := zip.FileInfoHeader(fi)
	if err != nil {
		return err
	}

	fh.Name = filepath.ToSlash(filepath.Clean(path))
	fh.Method = zip.Deflate // data compression algorithm

	if fi.IsDir() {
		fh.Name = fh.Name + "/" // be care the ending separator
	}

	entry, err := z.writer.CreateHeader(fh)
	if err != nil {
		return err
	}

	if fi.IsDir() {
		return nil
	}

	file, err := os.Open(name)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.Copy(entry, file)

	return err
}

// AddDirectoryN adds directories.
func (z *ZipFile) AddDirectoryN(path string, names ...string) error {
	for _, name := range names {
		err := z.AddDirectory(path, name)
		if err != nil {
			return err
		}
	}
	return nil
}

// AddDirectory adds a directory.
func (z *ZipFile) AddDirectory(path, dirName string) error {
	files, err := ioutil.ReadDir(dirName)
	if err != nil {
		return err
	}

	for _, file := range files {
		localPath := filepath.Join(dirName, file.Name())
		zipPath := filepath.Join(path, file.Name())

		err = nil
		if file.IsDir() {
			z.AddEntry(path, dirName)

			err = z.AddDirectory(zipPath, localPath)
		} else {
			err = z.AddEntry(zipPath, localPath)
		}
		if err != nil {
			return err
		}
	}

	return nil
}
