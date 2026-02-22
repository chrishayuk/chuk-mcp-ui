"""Tests for FastMCP decorator helpers."""

import asyncio
from chuk_view_schemas.fastmcp import (
    map_tool,
    chart_tool,
    view_tool,
    CDN_BASE,
    VIEW_PATHS,
)
from chuk_view_schemas import MapContent, MapLayer, ChartContent, ChartDataset


class MockMCP:
    """Mock FastMCP server for testing decorators."""

    name = "test-server"

    def __init__(self):
        self._tools: dict = {}

    def tool(self, **kwargs):
        def decorator(func):
            name = kwargs.get("name", func.__name__)
            self._tools[name] = {"func": func, "kwargs": kwargs}
            return func

        return decorator


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


class TestMapTool:
    def test_registers_tool_with_meta(self):
        mcp = MockMCP()

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

        # Tool was registered
        assert len(mcp._tools) == 1
        tool = list(mcp._tools.values())[0]
        assert "meta" in tool["kwargs"]
        assert "ui" in tool["kwargs"]["meta"]
        assert "resourceUri" in tool["kwargs"]["meta"]["ui"]
        assert "/map/v1" in tool["kwargs"]["meta"]["ui"]["resourceUri"]

    def test_wraps_pydantic_model(self):
        mcp = MockMCP()

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

        # Call the registered wrapper
        tool = list(mcp._tools.values())[0]
        result = run(tool["func"]())

        assert "structuredContent" in result
        assert "content" in result
        assert result["structuredContent"]["type"] == "map"
        assert result["structuredContent"]["version"] == "1.0"
        assert isinstance(result["content"], list)
        assert len(result["content"]) >= 1
        assert "Map with" in result["content"][0]["text"]


class TestChartTool:
    def test_registers_and_wraps(self):
        mcp = MockMCP()

        @chart_tool(mcp, "show_chart")
        async def show_chart():
            return ChartContent(
                title="Test",
                chart_type="bar",
                data=[ChartDataset(label="A", values=[{"label": "x", "value": 1}])],
            )

        tool = list(mcp._tools.values())[0]
        result = run(tool["func"]())

        assert result["structuredContent"]["type"] == "chart"
        assert "Chart:" in result["content"][0]["text"]


class TestDictPassthrough:
    def test_dict_with_structured_content_passes_through(self):
        mcp = MockMCP()

        @map_tool(mcp, "show_raw")
        async def show_raw():
            return {
                "content": [{"type": "text", "text": "Custom"}],
                "structuredContent": {"type": "map", "version": "1.0"},
            }

        tool = list(mcp._tools.values())[0]
        result = run(tool["func"]())

        assert result["content"][0]["text"] == "Custom"
        assert result["structuredContent"]["type"] == "map"

    def test_plain_dict_gets_wrapped(self):
        mcp = MockMCP()

        @view_tool(mcp, "show_data", "json")
        async def show_data():
            return {"type": "json", "version": "1.0", "data": {"key": "value"}}

        tool = list(mcp._tools.values())[0]
        result = run(tool["func"]())

        assert "structuredContent" in result
        assert "content" in result
        assert result["structuredContent"]["type"] == "json"


class TestCustomCdnBase:
    def test_custom_cdn_base(self):
        mcp = MockMCP()

        @map_tool(mcp, "show_map", cdn_base="https://custom.example.com")
        async def show_map():
            return {"type": "map", "version": "1.0"}

        tool = list(mcp._tools.values())[0]
        assert "custom.example.com" in tool["kwargs"]["meta"]["ui"]["resourceUri"]


class TestGenericViewTool:
    def test_generic_view_tool(self):
        mcp = MockMCP()

        @view_tool(mcp, "show_custom", "my-custom")
        async def show_custom():
            return {"type": "my-custom", "version": "1.0", "data": "hello"}

        tool = list(mcp._tools.values())[0]
        result = run(tool["func"]())

        assert result["structuredContent"]["type"] == "my-custom"
        assert "Showing my-custom view" in result["content"][0]["text"]


class TestViewPaths:
    def test_all_17_views_have_paths(self):
        expected = [
            "map",
            "chart",
            "datatable",
            "form",
            "markdown",
            "video",
            "pdf",
            "dashboard",
            "split",
            "tabs",
            "detail",
            "counter",
            "code",
            "progress",
            "confirm",
            "json",
            "status",
        ]
        for view in expected:
            assert view in VIEW_PATHS, f"Missing path for {view}"

    def test_cdn_base(self):
        assert CDN_BASE == "https://chuk-mcp-ui-views.fly.dev"
