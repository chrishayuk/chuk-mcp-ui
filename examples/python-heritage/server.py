"""
Example: Python MCP server using a hosted View from mcp-views.chukai.io.

This server has zero frontend code. It references a map View by URL
and sends GeoJSON data as structuredContent. That's it.
"""

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("heritage-explorer")

# The Views live on Fly.io. No npm, no Vite, no HTML.
MAP_VIEW = "https://mcp-views.chukai.io/map/v1"
TABLE_VIEW = "https://mcp-views.chukai.io/datatable/v1"
CHART_VIEW = "https://mcp-views.chukai.io/chart/v1"
DASHBOARD_VIEW = "https://mcp-views.chukai.io/dashboard/v1"

# Sample heritage data (replace with real API calls)
SAMPLE_SITES = [
    {
        "nhle_id": "1001234",
        "name": "Roman Villa, Colchester",
        "designation": "Scheduled Monument",
        "grade": "I",
        "lat": 51.889,
        "lon": 0.897,
    },
    {
        "nhle_id": "1005678",
        "name": "Medieval Church, Chelmsford",
        "designation": "Listed Building",
        "grade": "II*",
        "lat": 51.736,
        "lon": 0.469,
    },
    {
        "nhle_id": "1009012",
        "name": "Iron Age Hillfort, Danbury",
        "designation": "Scheduled Monument",
        "grade": "I",
        "lat": 51.712,
        "lon": 0.583,
    },
    {
        "nhle_id": "1003456",
        "name": "Tudor Manor House, Ingatestone",
        "designation": "Listed Building",
        "grade": "I",
        "lat": 51.667,
        "lon": 0.383,
    },
    {
        "nhle_id": "1007890",
        "name": "Victorian Pier, Southend",
        "designation": "Listed Building",
        "grade": "II",
        "lat": 51.514,
        "lon": 0.720,
    },
]

DESIGNATION_COLORS = {
    "Scheduled Monument": "#e63946",
    "Listed Building": "#457b9d",
    "Conservation Area": "#2a9d8f",
    "Registered Park": "#264653",
}


@mcp.tool(meta={"ui": {"resourceUri": MAP_VIEW}})
async def search_heritage_sites(bbox: str = "0.3,51.5,1.0,52.0") -> dict:
    """Search for heritage sites in a bounding box and display on a map."""

    # In production, this queries the Historic England API
    sites = SAMPLE_SITES

    return {
        "content": [
            {"type": "text", "text": f"Found {len(sites)} heritage sites."}
        ],
        "structuredContent": {
            "type": "map",
            "version": "1.0",
            "center": {"lat": 51.73, "lon": 0.65},
            "zoom": 10,
            "basemap": "osm",
            "layers": [
                {
                    "id": "heritage-sites",
                    "label": "Heritage Sites",
                    "cluster": {"enabled": True, "radius": 50},
                    "popup": {
                        "title": "{properties.name}",
                        "fields": ["designation", "grade"],
                        "actions": [
                            {
                                "label": "View Record",
                                "tool": "get_site_detail",
                                "arguments": {
                                    "nhle_id": "{properties.nhle_id}"
                                },
                            }
                        ],
                    },
                    "features": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [s["lon"], s["lat"]],
                                },
                                "properties": {
                                    "nhle_id": s["nhle_id"],
                                    "name": s["name"],
                                    "designation": s["designation"],
                                    "grade": s["grade"],
                                },
                            }
                            for s in sites
                        ],
                    },
                }
            ],
        },
    }


@mcp.tool(meta={"ui": {"resourceUri": TABLE_VIEW}})
async def list_heritage_sites() -> dict:
    """List all heritage sites as a sortable table."""

    return {
        "content": [
            {
                "type": "text",
                "text": f"Listing {len(SAMPLE_SITES)} heritage sites.",
            }
        ],
        "structuredContent": {
            "type": "datatable",
            "version": "1.0",
            "title": "Heritage Sites",
            "sortable": True,
            "filterable": True,
            "exportable": True,
            "columns": [
                {"key": "name", "label": "Name", "sortable": True, "width": "30%"},
                {
                    "key": "designation",
                    "label": "Designation",
                    "type": "badge",
                    "badgeColors": DESIGNATION_COLORS,
                },
                {"key": "grade", "label": "Grade", "sortable": True, "align": "center"},
                {"key": "nhle_id", "label": "NHLE ID", "align": "right"},
            ],
            "rows": [
                {
                    "name": s["name"],
                    "designation": s["designation"],
                    "grade": s["grade"],
                    "nhle_id": s["nhle_id"],
                }
                for s in SAMPLE_SITES
            ],
            "actions": [
                {
                    "label": "View",
                    "tool": "get_site_detail",
                    "arguments": {"nhle_id": "{nhle_id}"},
                }
            ],
        },
    }


@mcp.tool(meta={"ui": {"resourceUri": DASHBOARD_VIEW}})
async def heritage_dashboard() -> dict:
    """Show heritage sites in a composed dashboard with map, chart, and table."""

    from collections import Counter

    sites = SAMPLE_SITES
    designation_counts = Counter(s["designation"] for s in sites)

    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
            "properties": {
                "nhle_id": s["nhle_id"],
                "name": s["name"],
                "designation": s["designation"],
                "grade": s["grade"],
            },
        }
        for s in sites
    ]

    return {
        "content": [
            {"type": "text", "text": f"Heritage dashboard: {len(sites)} sites."}
        ],
        "structuredContent": {
            "type": "dashboard",
            "version": "1.0",
            "title": "Heritage Sites Explorer",
            "layout": "grid",
            "gap": "6px",
            "panels": [
                {
                    "id": "map-panel",
                    "label": "Map",
                    "viewUrl": MAP_VIEW,
                    "width": "60%",
                    "height": "60%",
                    "structuredContent": {
                        "type": "map",
                        "version": "1.0",
                        "center": {"lat": 51.73, "lon": 0.65},
                        "zoom": 10,
                        "layers": [
                            {
                                "id": "heritage-sites",
                                "label": "Heritage Sites",
                                "cluster": {"enabled": True, "radius": 50},
                                "popup": {
                                    "title": "{properties.name}",
                                    "fields": [
                                        "nhle_id",
                                        "designation",
                                        "grade",
                                    ],
                                },
                                "features": {
                                    "type": "FeatureCollection",
                                    "features": features,
                                },
                            }
                        ],
                    },
                },
                {
                    "id": "chart-panel",
                    "label": "Designations",
                    "viewUrl": CHART_VIEW,
                    "width": "40%",
                    "height": "60%",
                    "structuredContent": {
                        "type": "chart",
                        "version": "1.0",
                        "title": "Sites by Designation",
                        "chartType": "pie",
                        "data": [
                            {
                                "label": "Designations",
                                "values": [
                                    {"label": k, "value": v}
                                    for k, v in designation_counts.items()
                                ],
                            }
                        ],
                    },
                },
                {
                    "id": "table-panel",
                    "label": "All Sites",
                    "viewUrl": TABLE_VIEW,
                    "width": "100%",
                    "height": "40%",
                    "structuredContent": {
                        "type": "datatable",
                        "version": "1.0",
                        "title": "Heritage Sites",
                        "sortable": True,
                        "filterable": True,
                        "columns": [
                            {"key": "name", "label": "Name"},
                            {
                                "key": "designation",
                                "label": "Designation",
                                "type": "badge",
                                "badgeColors": DESIGNATION_COLORS,
                            },
                            {"key": "grade", "label": "Grade"},
                            {"key": "nhle_id", "label": "NHLE ID"},
                        ],
                        "rows": [
                            {
                                "name": s["name"],
                                "designation": s["designation"],
                                "grade": s["grade"],
                                "nhle_id": s["nhle_id"],
                            }
                            for s in sites
                        ],
                    },
                },
            ],
        },
    }


@mcp.tool()
async def get_site_detail(nhle_id: str) -> dict:
    """Get detailed information about a specific heritage site."""

    site = next((s for s in SAMPLE_SITES if s["nhle_id"] == nhle_id), None)
    if not site:
        return {
            "content": [{"type": "text", "text": f"Site {nhle_id} not found."}]
        }

    return {
        "content": [
            {
                "type": "text",
                "text": (
                    f"{site['name']} ({site['designation']}, "
                    f"Grade {site['grade']})\n"
                    f"NHLE ID: {site['nhle_id']}\n"
                    f"Location: {site['lat']}, {site['lon']}"
                ),
            }
        ]
    }
