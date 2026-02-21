"""Tests for the infer_view() data shape inference engine."""

import pytest
from chuk_view_schemas.infer import infer_view, infer_views, ViewSuggestion


class TestTier1ExactTypeMatch:
    """Tier 1: data with explicit 'type' field matching a known view."""

    def test_iv01_chart_with_type_field(self):
        data = {"type": "chart", "chartType": "bar", "data": []}
        result = infer_view(data)
        assert result.view == "chart"
        assert result.confidence == 1.0

    def test_iv15_chart_type_pie(self):
        data = {"type": "chart", "chartType": "pie", "data": [{"label": "A", "values": [1]}]}
        result = infer_view(data)
        assert result.view == "chart"
        assert result.confidence == 1.0


class TestTier2SignatureFields:
    """Tier 2: unique field combinations that identify a specific view."""

    def test_iv02_map_layers_and_center(self):
        data = {"layers": [{"features": []}], "center": {"lat": 51, "lon": 0}}
        result = infer_view(data)
        assert result.view == "map"
        assert result.confidence >= 0.90

    def test_iv03_datatable_columns_and_rows(self):
        data = {"columns": [{"key": "name"}], "rows": [{"name": "Alice"}]}
        result = infer_view(data)
        assert result.view == "datatable"
        assert result.confidence >= 0.90

    def test_iv04_form_schema_and_submit_tool(self):
        data = {"schema": {"properties": {"name": {"type": "string"}}}, "submitTool": "save"}
        result = infer_view(data)
        assert result.view == "form"
        assert result.confidence >= 0.90

    def test_iv05_timeline_events_with_dates(self):
        data = {"events": [{"date": "2024-01-01", "title": "Start"}]}
        result = infer_view(data)
        assert result.view == "timeline"
        assert result.confidence >= 0.85

    def test_iv06_gauge_value_and_thresholds(self):
        data = {"value": 75, "min": 0, "max": 100, "thresholds": [{"value": 50, "color": "yellow"}]}
        result = infer_view(data)
        assert result.view == "gauge"
        assert result.confidence >= 0.85

    def test_iv16_log_entries_with_level(self):
        data = {"entries": [{"level": "error", "message": "fail"}]}
        result = infer_view(data)
        assert result.view == "log"
        assert result.confidence >= 0.80

    def test_iv17_tree_nodes_and_edges(self):
        data = {"nodes": [{"id": "a"}], "edges": [{"from": "a", "to": "b"}]}
        result = infer_view(data)
        assert result.view == "tree"
        assert result.confidence >= 0.80

    def test_iv18_poll_options_with_votes(self):
        data = {"question": "?", "options": [{"text": "A", "votes": 5}]}
        result = infer_view(data)
        assert result.view == "poll"
        assert result.confidence >= 0.80

    def test_chart_type_field_without_type_discriminator(self):
        """chartType field alone should suggest chart even without type: "chart"."""
        data = {"chartType": "bar", "data": [{"label": "Q1", "values": [{"label": "A", "value": 10}]}]}
        result = infer_view(data)
        assert result.view == "chart"
        assert result.confidence >= 0.90


class TestTier3StructuralPatterns:
    """Tier 3: patterns inferred from data shape rather than specific field names."""

    def test_iv07_array_with_lat_lon(self):
        data = [{"lat": 51.5, "lon": -0.1, "name": "London"}]
        result = infer_view(data)
        assert result.view == "map"
        assert result.confidence >= 0.70

    def test_iv08_array_of_uniform_objects(self):
        data = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
        result = infer_view(data)
        # Should suggest datatable (or possibly chart)
        assert result.view in ("datatable", "chart")

    def test_iv09_label_value_pairs(self):
        data = [{"label": "Jan", "value": 100}, {"label": "Feb", "value": 200}]
        result = infer_view(data)
        assert result.view == "chart"
        assert result.confidence >= 0.60

    def test_iv10_detail_title_and_fields(self):
        data = {"title": "Site Report", "fields": [{"label": "Name", "value": "..."}]}
        result = infer_view(data)
        assert result.view == "detail"
        assert result.confidence >= 0.60

    def test_iv19_simple_value_dict(self):
        data = {"value": 42}
        result = infer_view(data)
        assert result.view == "counter"
        assert result.confidence >= 0.60


class TestTier4Fallback:
    """Tier 4: fallback when no strong pattern match."""

    def test_iv13_nested_dict(self):
        data = {"deeply": {"nested": {"data": 1}}}
        result = infer_view(data)
        assert result.view == "json"
        assert result.confidence >= 0.40

    def test_iv14_array_with_no_clear_pattern(self):
        data = [{"id": 1}, {"id": 2}]
        result = infer_view(data)
        assert result.view == "datatable"
        assert result.confidence >= 0.40


class TestScalarInputs:
    """Non-dict, non-list inputs."""

    def test_iv11_integer(self):
        result = infer_view(42)
        assert result.view == "counter"
        assert result.confidence >= 0.60

    def test_iv12_markdown_string(self):
        result = infer_view("# Hello\n\nSome **markdown** content")
        assert result.view == "markdown"
        assert result.confidence >= 0.60

    def test_iv20_code_string(self):
        result = infer_view("def hello():\n    print('hi')")
        assert result.view == "code"
        assert result.confidence >= 0.60


class TestInferViews:
    """Test the multi-suggestion infer_views() function."""

    def test_returns_multiple_suggestions(self):
        data = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
        results = infer_views(data, limit=3)
        assert len(results) >= 1
        assert all(isinstance(s, ViewSuggestion) for s in results)

    def test_suggestions_sorted_by_confidence(self):
        data = {"value": 42}
        results = infer_views(data, limit=3)
        for i in range(len(results) - 1):
            assert results[i].confidence >= results[i + 1].confidence

    def test_no_duplicate_view_names(self):
        data = {"chartType": "bar", "data": []}
        results = infer_views(data, limit=5)
        views = [s.view for s in results]
        assert len(views) == len(set(views))

    def test_limit_respected(self):
        data = [{"lat": 51, "lon": 0, "label": "X", "value": 1}]
        results = infer_views(data, limit=2)
        assert len(results) <= 2
