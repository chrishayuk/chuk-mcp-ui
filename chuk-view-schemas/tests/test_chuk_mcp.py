"""Tests for ChukMCPServer decorator helpers."""

import asyncio
from chuk_view_schemas.chuk_mcp import (
    map_tool,
    chart_tool,
    view_tool,
    CDN_BASE,
    VIEW_PATHS,
)
from chuk_view_schemas import MapContent, MapLayer, ChartContent, ChartDataset


class MockChukMCPServer:
    """Mock ChukMCPServer for testing decorators."""

    def __init__(self):
        self._tools: dict = {}

    def tool(self, name=None, description=None, **kwargs):
        def decorator(func):
            tool_name = name or func.__name__
            self._tools[tool_name] = {
                "func": func,
                "name": tool_name,
                "description": description,
                "kwargs": kwargs,
            }
            return func

        if callable(name):
            func = name
            name = None
            return decorator(func)
        return decorator


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


class TestToolNameForwarding:
    """Verify tool_name is explicitly passed (unlike fastmcp.py)."""

    def test_tool_name_is_forwarded(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "custom_tool_name")
        async def some_function():
            return MapContent(
                center={"lat": 51.5, "lon": -0.1},
                zoom=10,
                layers=[
                    MapLayer(
                        id="test",
                        label="Test",
                        features={"type": "FeatureCollection", "features": []},
                    )
                ],
            )

        # Tool registered under the explicit name, not the function name
        assert "custom_tool_name" in mcp._tools
        assert "some_function" not in mcp._tools


class TestMetaRegistration:
    def test_registers_tool_with_meta(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "show_map")
        async def show_map():
            return MapContent(
                center={"lat": 51.5, "lon": -0.1},
                zoom=10,
                layers=[
                    MapLayer(
                        id="test",
                        label="Test",
                        features={"type": "FeatureCollection", "features": []},
                    )
                ],
            )

        assert len(mcp._tools) == 1
        tool = mcp._tools["show_map"]
        assert "meta" in tool["kwargs"]
        assert "ui" in tool["kwargs"]["meta"]
        assert "resourceUri" in tool["kwargs"]["meta"]["ui"]
        assert "/map/v1" in tool["kwargs"]["meta"]["ui"]["resourceUri"]


class TestHintKwargs:
    def test_read_only_hint_forwarded(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "safe_map", read_only_hint=True)
        async def safe_map():
            return {"type": "map", "version": "1.0"}

        tool = mcp._tools["safe_map"]
        assert tool["kwargs"]["read_only_hint"] is True

    def test_multiple_hints_forwarded(self):
        mcp = MockChukMCPServer()

        @view_tool(
            mcp,
            "lookup",
            "json",
            read_only_hint=True,
            idempotent_hint=True,
        )
        async def lookup():
            return {"type": "json", "version": "1.0", "data": {}}

        tool = mcp._tools["lookup"]
        assert tool["kwargs"]["read_only_hint"] is True
        assert tool["kwargs"]["idempotent_hint"] is True
        # Hints not passed should not be present
        assert "destructive_hint" not in tool["kwargs"]
        assert "open_world_hint" not in tool["kwargs"]


class TestPydanticModel:
    def test_wraps_pydantic_model(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "show_map")
        async def show_map():
            return MapContent(
                center={"lat": 51.5, "lon": -0.1},
                zoom=10,
                layers=[
                    MapLayer(
                        id="test",
                        label="Test Layer",
                        features={"type": "FeatureCollection", "features": []},
                    )
                ],
            )

        tool = mcp._tools["show_map"]
        result = run(tool["func"]())

        assert "structuredContent" in result
        assert "content" in result
        assert result["structuredContent"]["type"] == "map"
        assert result["structuredContent"]["version"] == "1.0"
        assert isinstance(result["content"], list)
        assert "Map with" in result["content"][0]["text"]


class TestChartTool:
    def test_registers_and_wraps(self):
        mcp = MockChukMCPServer()

        @chart_tool(mcp, "show_chart")
        async def show_chart():
            return ChartContent(
                title="Test",
                chart_type="bar",
                data=[ChartDataset(label="A", values=[{"label": "x", "value": 1}])],
            )

        tool = mcp._tools["show_chart"]
        result = run(tool["func"]())

        assert result["structuredContent"]["type"] == "chart"
        assert "Chart:" in result["content"][0]["text"]


class TestDictPassthrough:
    def test_dict_with_structured_content_passes_through(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "show_raw")
        async def show_raw():
            return {
                "content": [{"type": "text", "text": "Custom"}],
                "structuredContent": {"type": "map", "version": "1.0"},
            }

        tool = mcp._tools["show_raw"]
        result = run(tool["func"]())

        assert result["content"][0]["text"] == "Custom"
        assert result["structuredContent"]["type"] == "map"

    def test_plain_dict_gets_wrapped(self):
        mcp = MockChukMCPServer()

        @view_tool(mcp, "show_data", "json")
        async def show_data():
            return {"type": "json", "version": "1.0", "data": {"key": "value"}}

        tool = mcp._tools["show_data"]
        result = run(tool["func"]())

        assert "structuredContent" in result
        assert "content" in result
        assert result["structuredContent"]["type"] == "json"


class TestCustomCdnBase:
    def test_custom_cdn_base(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "show_map", cdn_base="https://custom.example.com")
        async def show_map():
            return {"type": "map", "version": "1.0"}

        tool = mcp._tools["show_map"]
        assert "custom.example.com" in tool["kwargs"]["meta"]["ui"]["resourceUri"]


class TestGenericViewTool:
    def test_generic_view_tool(self):
        mcp = MockChukMCPServer()

        @view_tool(mcp, "show_custom", "my-custom")
        async def show_custom():
            return {"type": "my-custom", "version": "1.0", "data": "hello"}

        tool = mcp._tools["show_custom"]
        result = run(tool["func"]())

        assert result["structuredContent"]["type"] == "my-custom"
        assert "Showing my-custom view" in result["content"][0]["text"]
