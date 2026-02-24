"""Tests for FastMCP decorator helpers."""

import asyncio
from chuk_view_schemas.fastmcp import (
    map_tool,
    chart_tool,
    view_tool,
    gallery_tool,
    timeline_tool,
    heatmap_tool,
    sankey_tool,
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
        assert tool["kwargs"]["meta"]["ui"]["resourceUri"] == "ui://test-server/map"
        assert "/map/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]

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
        assert result["structuredContent"]["type"] == "map"
        assert result["structuredContent"]["version"] == "1.0"


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
        assert result["structuredContent"]["type"] == "json"


class TestCustomCdnBase:
    def test_custom_cdn_base(self):
        mcp = MockMCP()

        @map_tool(mcp, "show_map", cdn_base="https://custom.example.com")
        async def show_map():
            return {"type": "map", "version": "1.0"}

        tool = list(mcp._tools.values())[0]
        assert tool["kwargs"]["meta"]["ui"]["resourceUri"] == "ui://test-server/map"
        assert "custom.example.com" in tool["kwargs"]["meta"]["ui"]["viewUrl"]


class TestGenericViewTool:
    def test_generic_view_tool(self):
        mcp = MockMCP()

        @view_tool(mcp, "show_custom", "my-custom")
        async def show_custom():
            return {"type": "my-custom", "version": "1.0", "data": "hello"}

        tool = list(mcp._tools.values())[0]
        result = run(tool["func"]())

        assert result["structuredContent"]["type"] == "my-custom"


class TestViewPaths:
    def test_all_66_views_have_paths(self):
        expected = [
            "map", "chart", "datatable", "form", "markdown", "video", "pdf",
            "dashboard", "split", "tabs", "detail", "counter", "code",
            "progress", "confirm", "json", "status",
            "gallery", "tree", "timeline", "log", "image", "compare",
            "chat", "ranked", "quiz", "poll",
            "alert", "stepper", "filter", "settings", "embed", "diff", "kanban",
            "audio", "carousel", "heatmap", "gauge", "treemap", "sunburst",
            "scatter", "boxplot", "pivot", "crosstab", "layers", "timeseries",
            "profile", "minimap", "gis-legend", "terminal", "spectrogram",
            "annotation", "calendar", "flowchart", "funnel", "gantt",
            "geostory", "globe", "graph", "investigation", "neural",
            "notebook", "sankey", "slides", "swimlane", "threed",
        ]
        assert len(expected) == 66
        for view in expected:
            assert view in VIEW_PATHS, f"Missing path for {view}"
        assert len(VIEW_PATHS) == 66

    def test_cdn_base(self):
        assert CDN_BASE == "https://mcp-views.chukai.io"


class TestPermissionsCspVisibility:
    def test_permissions_in_meta(self):
        mcp = MockMCP()
        perms = {"camera": {}, "microphone": {}}

        @map_tool(mcp, "cam_map", permissions=perms)
        async def cam_map():
            return {"type": "map", "version": "1.0"}

        tool = mcp._tools["cam_map"]
        assert tool["kwargs"]["meta"]["ui"]["permissions"] == perms

    def test_csp_in_meta(self):
        mcp = MockMCP()
        csp = {"connectDomains": ["api.example.com"]}

        @chart_tool(mcp, "api_chart", csp=csp)
        async def api_chart():
            return {"type": "chart", "version": "1.0"}

        tool = mcp._tools["api_chart"]
        assert tool["kwargs"]["meta"]["ui"]["csp"] == csp

    def test_visibility_in_meta(self):
        mcp = MockMCP()

        @view_tool(mcp, "app_only", "json", visibility=["app"])
        async def app_only():
            return {"type": "json", "version": "1.0", "data": {}}

        tool = mcp._tools["app_only"]
        assert tool["kwargs"]["meta"]["ui"]["visibility"] == ["app"]

    def test_prefers_border_in_meta(self):
        mcp = MockMCP()

        @chart_tool(mcp, "bordered", prefers_border=True)
        async def bordered():
            return {"type": "chart", "version": "1.0"}

        tool = mcp._tools["bordered"]
        assert tool["kwargs"]["meta"]["ui"]["prefersBorder"] is True

    def test_no_extra_keys_when_not_set(self):
        mcp = MockMCP()

        @map_tool(mcp, "plain")
        async def plain():
            return {"type": "map", "version": "1.0"}

        ui = mcp._tools["plain"]["kwargs"]["meta"]["ui"]
        assert "permissions" not in ui
        assert "csp" not in ui
        assert "visibility" not in ui
        assert "prefersBorder" not in ui

    def test_all_params_together(self):
        mcp = MockMCP()

        @view_tool(
            mcp, "full", "dashboard",
            permissions={"clipboard-write": {}},
            csp={"frameDomains": ["embed.example.com"]},
            visibility=["model", "app"],
            prefers_border=False,
        )
        async def full():
            return {"type": "dashboard", "version": "1.0"}

        ui = mcp._tools["full"]["kwargs"]["meta"]["ui"]
        assert ui["permissions"] == {"clipboard-write": {}}
        assert ui["csp"] == {"frameDomains": ["embed.example.com"]}
        assert ui["visibility"] == ["model", "app"]
        assert ui["prefersBorder"] is False


class TestNewPerViewDecorators:
    def test_gallery_tool(self):
        mcp = MockMCP()

        @gallery_tool(mcp, "show_gallery")
        async def show_gallery():
            return {"type": "gallery", "version": "1.0"}

        tool = mcp._tools["show_gallery"]
        assert tool["kwargs"]["meta"]["ui"]["resourceUri"] == "ui://test-server/gallery"
        assert "/gallery/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]

    def test_timeline_tool(self):
        mcp = MockMCP()

        @timeline_tool(mcp, "show_timeline")
        async def show_timeline():
            return {"type": "timeline", "version": "1.0"}

        tool = mcp._tools["show_timeline"]
        assert "ui://test-server/timeline" == tool["kwargs"]["meta"]["ui"]["resourceUri"]

    def test_heatmap_tool(self):
        mcp = MockMCP()

        @heatmap_tool(mcp, "show_heatmap")
        async def show_heatmap():
            return {"type": "heatmap", "version": "1.0"}

        tool = mcp._tools["show_heatmap"]
        assert "/heatmap/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]

    def test_sankey_tool(self):
        mcp = MockMCP()

        @sankey_tool(mcp, "show_sankey")
        async def show_sankey():
            return {"type": "sankey", "version": "1.0"}

        tool = mcp._tools["show_sankey"]
        assert "/sankey/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]

    def test_new_decorator_with_permissions(self):
        mcp = MockMCP()

        @gallery_tool(mcp, "cam_gallery", permissions={"camera": {}})
        async def cam_gallery():
            return {"type": "gallery", "version": "1.0"}

        ui = mcp._tools["cam_gallery"]["kwargs"]["meta"]["ui"]
        assert ui["permissions"] == {"camera": {}}
