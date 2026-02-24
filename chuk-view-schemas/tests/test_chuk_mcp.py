"""Tests for ChukMCPServer decorator helpers."""

import asyncio
from chuk_view_schemas.chuk_mcp import (
    _has_view_tool,
    map_tool,
    chart_tool,
    view_tool,
    gallery_tool,
    timeline_tool,
    heatmap_tool,
    sankey_tool,
)
from chuk_view_schemas import MapContent, MapLayer, ChartContent, ChartDataset


class MockChukMCPServer:
    """Mock ChukMCPServer (old-style, no view_tool method) for testing decorators."""

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


class MockChukMCPServerWithViewTool:
    """Mock ChukMCPServer >= 0.24 with view_tool method."""

    name = "test-chuk-server"

    def __init__(self):
        self._tools: dict = {}
        self._view_tools: dict = {}

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

    def view_tool(self, **kwargs):
        def decorator(func):
            tool_name = kwargs.get("name", func.__name__)
            self._view_tools[tool_name] = {
                "func": func,
                "name": tool_name,
                "kwargs": kwargs,
            }
            return func

        return decorator


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


class TestHasViewTool:
    def test_detects_view_tool_method(self):
        mcp = MockChukMCPServerWithViewTool()
        assert _has_view_tool(mcp) is True

    def test_no_view_tool_method(self):
        mcp = MockChukMCPServer()
        assert _has_view_tool(mcp) is False

    def test_non_callable_view_tool_attr(self):
        mcp = MockChukMCPServer()
        mcp.view_tool = "not a callable"
        assert _has_view_tool(mcp) is False


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
        assert tool["kwargs"]["meta"]["ui"]["resourceUri"] == "ui://mcp-server/map"
        assert "/map/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]


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
        assert result["structuredContent"]["type"] == "map"
        assert result["structuredContent"]["version"] == "1.0"


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
        assert result["structuredContent"]["type"] == "json"


class TestCustomCdnBase:
    def test_custom_cdn_base(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "show_map", cdn_base="https://custom.example.com")
        async def show_map():
            return {"type": "map", "version": "1.0"}

        tool = mcp._tools["show_map"]
        assert tool["kwargs"]["meta"]["ui"]["resourceUri"] == "ui://mcp-server/map"
        assert "custom.example.com" in tool["kwargs"]["meta"]["ui"]["viewUrl"]


class TestGenericViewTool:
    def test_generic_view_tool(self):
        mcp = MockChukMCPServer()

        @view_tool(mcp, "show_custom", "my-custom")
        async def show_custom():
            return {"type": "my-custom", "version": "1.0", "data": "hello"}

        tool = mcp._tools["show_custom"]
        result = run(tool["func"]())

        assert result["structuredContent"]["type"] == "my-custom"


class TestViewToolPath:
    """Tests for the ChukMCPServer >= 0.24 view_tool() path."""

    def test_uses_view_tool_when_available(self):
        mcp = MockChukMCPServerWithViewTool()

        @map_tool(mcp, "show_map")
        async def show_map():
            return {"type": "map", "version": "1.0"}

        # Registered via view_tool, not tool
        assert "show_map" in mcp._view_tools
        assert len(mcp._tools) == 0

    def test_view_tool_receives_resource_uri(self):
        mcp = MockChukMCPServerWithViewTool()

        @chart_tool(mcp, "show_chart")
        async def show_chart():
            return {"type": "chart", "version": "1.0"}

        vt = mcp._view_tools["show_chart"]
        assert vt["kwargs"]["resource_uri"] == "ui://test-chuk-server/chart"

    def test_view_tool_receives_view_url(self):
        mcp = MockChukMCPServerWithViewTool()

        @chart_tool(mcp, "show_chart")
        async def show_chart():
            return {"type": "chart", "version": "1.0"}

        vt = mcp._view_tools["show_chart"]
        assert "/chart/v1" in vt["kwargs"]["view_url"]

    def test_view_tool_receives_permissions(self):
        mcp = MockChukMCPServerWithViewTool()
        perms = {"camera": {}, "microphone": {}}

        @map_tool(mcp, "cam_map", permissions=perms)
        async def cam_map():
            return {"type": "map", "version": "1.0"}

        vt = mcp._view_tools["cam_map"]
        assert vt["kwargs"]["permissions"] == perms

    def test_view_tool_receives_csp(self):
        mcp = MockChukMCPServerWithViewTool()
        csp = {"connectDomains": ["api.example.com"]}

        @chart_tool(mcp, "api_chart", csp=csp)
        async def api_chart():
            return {"type": "chart", "version": "1.0"}

        vt = mcp._view_tools["api_chart"]
        assert vt["kwargs"]["csp"] == csp

    def test_view_tool_receives_visibility(self):
        mcp = MockChukMCPServerWithViewTool()

        @view_tool(mcp, "app_only", "json", visibility=["app"])
        async def app_only():
            return {"type": "json", "version": "1.0", "data": {}}

        vt = mcp._view_tools["app_only"]
        assert vt["kwargs"]["visibility"] == ["app"]

    def test_view_tool_receives_prefers_border(self):
        mcp = MockChukMCPServerWithViewTool()

        @chart_tool(mcp, "bordered", prefers_border=True)
        async def bordered():
            return {"type": "chart", "version": "1.0"}

        vt = mcp._view_tools["bordered"]
        assert vt["kwargs"]["prefers_border"] is True

    def test_view_tool_no_extra_keys(self):
        mcp = MockChukMCPServerWithViewTool()

        @map_tool(mcp, "plain")
        async def plain():
            return {"type": "map", "version": "1.0"}

        vt = mcp._view_tools["plain"]
        assert "permissions" not in vt["kwargs"]
        assert "csp" not in vt["kwargs"]
        assert "visibility" not in vt["kwargs"]
        assert "prefers_border" not in vt["kwargs"]

    def test_view_tool_all_params(self):
        mcp = MockChukMCPServerWithViewTool()

        @view_tool(
            mcp, "full", "dashboard",
            description="Full dashboard",
            permissions={"clipboard-write": {}},
            csp={"frameDomains": ["embed.example.com"]},
            visibility=["model", "app"],
            prefers_border=False,
        )
        async def full():
            return {"type": "dashboard", "version": "1.0"}

        vt = mcp._view_tools["full"]
        assert vt["kwargs"]["description"] == "Full dashboard"
        assert vt["kwargs"]["permissions"] == {"clipboard-write": {}}
        assert vt["kwargs"]["csp"] == {"frameDomains": ["embed.example.com"]}
        assert vt["kwargs"]["visibility"] == ["model", "app"]
        assert vt["kwargs"]["prefers_border"] is False

    def test_view_tool_wrapper_produces_structured_content(self):
        mcp = MockChukMCPServerWithViewTool()

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

        vt = mcp._view_tools["show_map"]
        result = run(vt["func"]())

        assert "structuredContent" in result
        assert result["structuredContent"]["type"] == "map"


class TestFallbackMetaPath:
    """Tests for the fallback path (old servers without view_tool)."""

    def test_permissions_in_meta(self):
        mcp = MockChukMCPServer()
        perms = {"camera": {}}

        @map_tool(mcp, "cam_map", permissions=perms)
        async def cam_map():
            return {"type": "map", "version": "1.0"}

        tool = mcp._tools["cam_map"]
        assert tool["kwargs"]["meta"]["ui"]["permissions"] == perms

    def test_csp_in_meta(self):
        mcp = MockChukMCPServer()
        csp = {"connectDomains": ["api.example.com"]}

        @chart_tool(mcp, "api_chart", csp=csp)
        async def api_chart():
            return {"type": "chart", "version": "1.0"}

        tool = mcp._tools["api_chart"]
        assert tool["kwargs"]["meta"]["ui"]["csp"] == csp

    def test_visibility_in_meta(self):
        mcp = MockChukMCPServer()

        @view_tool(mcp, "app_only", "json", visibility=["app"])
        async def app_only():
            return {"type": "json", "version": "1.0", "data": {}}

        tool = mcp._tools["app_only"]
        assert tool["kwargs"]["meta"]["ui"]["visibility"] == ["app"]

    def test_prefers_border_in_meta(self):
        mcp = MockChukMCPServer()

        @chart_tool(mcp, "bordered", prefers_border=True)
        async def bordered():
            return {"type": "chart", "version": "1.0"}

        tool = mcp._tools["bordered"]
        assert tool["kwargs"]["meta"]["ui"]["prefersBorder"] is True

    def test_no_extra_keys_in_meta(self):
        mcp = MockChukMCPServer()

        @map_tool(mcp, "plain")
        async def plain():
            return {"type": "map", "version": "1.0"}

        ui = mcp._tools["plain"]["kwargs"]["meta"]["ui"]
        assert "permissions" not in ui
        assert "csp" not in ui
        assert "visibility" not in ui
        assert "prefersBorder" not in ui


class TestNewPerViewDecorators:
    def test_gallery_tool(self):
        mcp = MockChukMCPServer()

        @gallery_tool(mcp, "show_gallery")
        async def show_gallery():
            return {"type": "gallery", "version": "1.0"}

        tool = mcp._tools["show_gallery"]
        assert tool["kwargs"]["meta"]["ui"]["resourceUri"] == "ui://mcp-server/gallery"

    def test_timeline_tool(self):
        mcp = MockChukMCPServer()

        @timeline_tool(mcp, "show_timeline")
        async def show_timeline():
            return {"type": "timeline", "version": "1.0"}

        tool = mcp._tools["show_timeline"]
        assert "ui://mcp-server/timeline" == tool["kwargs"]["meta"]["ui"]["resourceUri"]

    def test_heatmap_tool(self):
        mcp = MockChukMCPServer()

        @heatmap_tool(mcp, "show_heatmap")
        async def show_heatmap():
            return {"type": "heatmap", "version": "1.0"}

        tool = mcp._tools["show_heatmap"]
        assert "/heatmap/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]

    def test_sankey_tool(self):
        mcp = MockChukMCPServer()

        @sankey_tool(mcp, "show_sankey")
        async def show_sankey():
            return {"type": "sankey", "version": "1.0"}

        tool = mcp._tools["show_sankey"]
        assert "/sankey/v1" in tool["kwargs"]["meta"]["ui"]["viewUrl"]

    def test_new_decorator_via_view_tool_path(self):
        mcp = MockChukMCPServerWithViewTool()

        @gallery_tool(mcp, "show_gallery", permissions={"camera": {}})
        async def show_gallery():
            return {"type": "gallery", "version": "1.0"}

        vt = mcp._view_tools["show_gallery"]
        assert vt["kwargs"]["permissions"] == {"camera": {}}
        assert "ui://test-chuk-server/gallery" == vt["kwargs"]["resource_uri"]
