"""Tests for interaction schema fields (ChartClickAction, DataTable pagination)."""

from chuk_view_schemas import (
    ChartContent,
    ChartDataset,
    ChartClickAction,
    DataTableContent,
    Column,
)


# ---------------------------------------------------------------------------
# ChartClickAction + ChartContent.on_click_tool
# ---------------------------------------------------------------------------

class TestChartClickAction:
    def test_chart_content_accepts_on_click_tool(self):
        """ChartContent accepts onClickTool with a ChartClickAction."""
        action = ChartClickAction(
            tool="drill_down",
            arguments={"label": "{{label}}", "value": "{{value}}"},
        )
        chart = ChartContent(
            chart_type="bar",
            data=[ChartDataset(label="Sales", values=[10, 20, 30])],
            on_click_tool=action,
        )
        assert chart.on_click_tool is not None
        assert chart.on_click_tool.tool == "drill_down"
        assert chart.on_click_tool.arguments == {
            "label": "{{label}}",
            "value": "{{value}}",
        }

    def test_chart_content_without_on_click_tool(self):
        """ChartContent works without onClickTool (backward compatibility)."""
        chart = ChartContent(
            chart_type="line",
            data=[ChartDataset(label="Revenue", values=[100, 200])],
        )
        assert chart.on_click_tool is None

    def test_chart_click_action_serializes_with_alias(self):
        """ChartClickAction serializes using camelCase aliases."""
        action = ChartClickAction(
            tool="show_detail",
            arguments={"id": "{{id}}"},
        )
        dumped = action.model_dump(by_alias=True)
        assert dumped["tool"] == "show_detail"
        assert dumped["arguments"] == {"id": "{{id}}"}

    def test_chart_content_on_click_tool_serializes_with_alias(self):
        """ChartContent serializes onClickTool with camelCase alias."""
        chart = ChartContent(
            chart_type="pie",
            data=[ChartDataset(label="Share", values=[40, 60])],
            on_click_tool=ChartClickAction(tool="expand"),
        )
        dumped = chart.model_dump(by_alias=True)
        assert "onClickTool" in dumped
        assert dumped["onClickTool"]["tool"] == "expand"

    def test_chart_click_action_arguments_optional(self):
        """ChartClickAction works without arguments."""
        action = ChartClickAction(tool="refresh")
        assert action.arguments is None
        dumped = action.model_dump(by_alias=True)
        assert dumped["arguments"] is None


# ---------------------------------------------------------------------------
# DataTableContent pagination fields
# ---------------------------------------------------------------------------

class TestDataTablePagination:
    def _make_table(self, **kwargs):
        """Helper to create a minimal DataTableContent."""
        return DataTableContent(
            columns=[Column(key="name", label="Name")],
            rows=[{"name": "Alice"}, {"name": "Bob"}],
            **kwargs,
        )

    def test_datatable_accepts_pagination_fields(self):
        """DataTableContent accepts paginationTool, totalRows, pageSize, currentPage."""
        table = self._make_table(
            pagination_tool="load_page",
            total_rows=500,
            page_size=25,
            current_page=1,
        )
        assert table.pagination_tool == "load_page"
        assert table.total_rows == 500
        assert table.page_size == 25
        assert table.current_page == 1

    def test_datatable_without_pagination(self):
        """DataTableContent works without pagination fields (backward compatibility)."""
        table = self._make_table()
        assert table.pagination_tool is None
        assert table.total_rows is None
        assert table.page_size is None
        assert table.current_page is None

    def test_datatable_pagination_serializes_camel_case(self):
        """Pagination fields serialize with camelCase aliases."""
        table = self._make_table(
            pagination_tool="fetch_page",
            total_rows=1000,
            page_size=50,
            current_page=3,
        )
        dumped = table.model_dump(by_alias=True)
        assert dumped["paginationTool"] == "fetch_page"
        assert dumped["totalRows"] == 1000
        assert dumped["pageSize"] == 50
        assert dumped["currentPage"] == 3

    def test_datatable_partial_pagination(self):
        """DataTableContent works with only some pagination fields set."""
        table = self._make_table(
            pagination_tool="load_more",
            total_rows=100,
        )
        assert table.pagination_tool == "load_more"
        assert table.total_rows == 100
        assert table.page_size is None
        assert table.current_page is None
