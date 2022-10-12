import React, { useState, useEffect, useRef } from "react";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, ClassicEditor } = editorRef.current || {};

  useEffect(() => {
    editorRef.current = {
      CKEditor: require("@ckeditor/ckeditor5-react").CKEditor,
      ClassicEditor: require("./editor"),
    };

    setEditorLoaded(true);
  }, []);

  return (
    <>
      {editorLoaded && (
        <CKEditor className="mt-3 wrap-ckeditor" onChange={onChange} editor={ClassicEditor} />
      )}
    </>
  );
}
