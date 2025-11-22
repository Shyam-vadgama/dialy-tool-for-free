from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
import subprocess
import json
import jsbeautifier

router = APIRouter()

class CodeLanguage(str, Enum):
    python = "python"
    javascript = "javascript"
    html = "html"
    css = "css"
    json = "json"

class FormatCodeRequest(BaseModel):
    code: str
    language: CodeLanguage

@router.post("/api/format-code")
async def format_code(request: FormatCodeRequest):
    formatted_code = ""
    if request.language == CodeLanguage.python:
        try:
            # Black expects bytes and returns bytes
            process = subprocess.run(
                ["black", "-q", "-"],
                input=request.code.encode("utf-8"),
                capture_output=True,
                check=True
            )
            formatted_code = process.stdout.decode("utf-8")
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=400, detail=f"Python formatting failed: {e.stderr.decode()}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error during Python formatting: {str(e)}")
    elif request.language == CodeLanguage.javascript:
        formatted_code = jsbeautifier.beautify(request.code, {
            'indent_size': 4,
            'indent_char': ' ',
            'eol': '\n',
            'brace_style': 'collapse',
            'preserve_newlines': True,
            'max_preserve_newlines': 2,
            'space_in_paren': False,
            'space_in_empty_paren': False,
            'jslint_happy': False,
            'space_after_anon_function': False,
            'space_after_named_function': False,
            'wrap_line_length': 0,
            'break_chained_methods': False,
            'keep_array_indentation': False,
            'unescape_strings': False,
            'e4x': False,
            'comma_first': False,
            'operator_position': 'before-newline',
            'unindent_chained_methods': False,
            'indent_empty_lines': False,
            'templating': ['auto']
        })
    elif request.language == CodeLanguage.html:
        formatted_code = jsbeautifier.htmlbeautifier.beautify(request.code, {
            'indent_size': 4,
            'indent_char': ' ',
            'eol': '\n',
            'brace_style': 'collapse',
            'preserve_newlines': True,
            'max_preserve_newlines': 2,
            'indent_empty_lines': False,
            'unformatted': ['a', 'span', 'img', 'b', 'i', 'br', 'em', 'strong', 'code', 'kbd', 'sub', 'sup', 'cite', 'abbr', 'acronym', 'small', 'tt', 'del', 'ins', 's', 'strike', 'u', 'var', 'samp', 'dfn', 'mark', 'q', 'output', 'time', 'progress', 'meter', 'template'],
            'content_unformatted': [],
            'extra_liners': ['head', 'body', '/html'],
            'indent_inner_html': False,
            'wrap_line_length': 0,
            'wrap_attributes': 'auto',
            'wrap_attributes_indent_size': 4,
            'inline': ['a', 'span', 'img', 'b', 'i', 'br', 'em', 'strong', 'code', 'kbd', 'sub', 'sup', 'cite', 'abbr', 'acronym', 'small', 'tt', 'del', 'ins', 's', 'strike', 'u', 'var', 'samp', 'dfn', 'mark', 'q', 'output', 'time', 'progress', 'meter', 'template']
        })
    elif request.language == CodeLanguage.css:
        formatted_code = jsbeautifier.cssbeautifier.beautify(request.code, {
            'indent_size': 4,
            'indent_char': ' ',
            'eol': '\n',
            'selector_separator_newline': True,
            'end_with_newline': False,
            'newline_between_rules': True,
            'space_around_combinator': True
        })
    elif request.language == CodeLanguage.json:
        try:
            parsed_json = json.loads(request.code)
            formatted_code = json.dumps(parsed_json, indent=4)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported language for formatting.")

    return {"formatted_code": formatted_code}