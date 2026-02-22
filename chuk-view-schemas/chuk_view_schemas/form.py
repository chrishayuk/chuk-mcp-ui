from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class FieldSchema(BaseModel):
    type: Literal["string", "number", "integer", "boolean"]
    title: Optional[str] = None
    description: Optional[str] = None
    default: Optional[Any] = None
    enum: Optional[List[Union[str, int, float]]] = None
    enum_labels: Optional[List[str]] = Field(None, alias="enumLabels")
    minimum: Optional[float] = None
    maximum: Optional[float] = None
    min_length: Optional[int] = Field(None, alias="minLength")
    max_length: Optional[int] = Field(None, alias="maxLength")
    pattern: Optional[str] = None

    model_config = {"populate_by_name": True}


class JSONSchemaField(BaseModel):
    type: Literal["object"] = "object"
    required: Optional[List[str]] = None
    properties: Dict[str, FieldSchema]


class FieldUI(BaseModel):
    widget: Optional[
        Literal[
            "text",
            "textarea",
            "select",
            "radio",
            "checkbox",
            "slider",
            "date",
            "datetime",
            "color",
            "password",
            "hidden",
            "number",
        ]
    ] = None
    placeholder: Optional[str] = None
    help: Optional[str] = None
    disabled: Optional[bool] = None
    readonly: Optional[bool] = None


class FieldGroup(BaseModel):
    title: str
    fields: List[str]
    collapsible: Optional[bool] = None
    collapsed: Optional[bool] = None


class UISchema(BaseModel):
    order: Optional[List[str]] = None
    fields: Optional[Dict[str, FieldUI]] = None
    groups: Optional[List[FieldGroup]] = None


class FormContent(BaseModel):
    type: Literal["form"] = "form"
    version: Literal["1.0"] = "1.0"
    title: Optional[str] = None
    description: Optional[str] = None
    schema_: JSONSchemaField = Field(alias="schema")
    ui_schema: Optional[UISchema] = Field(None, alias="uiSchema")
    initial_values: Optional[Dict[str, Any]] = Field(None, alias="initialValues")
    submit_tool: str = Field(alias="submitTool")
    submit_label: Optional[str] = Field(None, alias="submitLabel")
    cancelable: Optional[bool] = None
    layout: Optional[Literal["vertical", "horizontal"]] = None

    model_config = {"populate_by_name": True}
