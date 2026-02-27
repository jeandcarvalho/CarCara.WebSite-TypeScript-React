# CarCará Website 🌐🦅

### View & Access Module

The **CarCará Website** is the public interface of the CarCará
platform.\
It provides structured access to multimodal automotive acquisitions
processed and distributed by the **CarCará API**.

This module enables users to search, filter, inspect, and download
automotive datasets and media assets through an intuitive web interface.

------------------------------------------------------------------------

## 🧩 Architecture Context

CarCará is composed of three integrated modules:

1.  **Data Processing & Ingestion Module (Local Software)**\
    Processes and enriches 5-minute automotive acquisitions.

2.  **Data Storage & Distribution Module (CarCará API)**\
    Stores multimodal 1 Hz data and exposes structured endpoints.

3.  **View & Access Module (This Website)**\
    Consumes the API to provide filtering, visualization, and download
    capabilities.

------------------------------------------------------------------------

## 🚀 What the Website Provides

### 🔎 Advanced Filtering Interface

The Website exposes the full power of the API search system through a
clean UI, allowing users to filter by:

-   Vehicle type
-   Speed range
-   Steering wheel angle
-   Brake status
-   YOLO object class
-   YOLO confidence and distance
-   OSM highway type
-   Landuse classification
-   Semantic segmentation ratios
-   Weather period and condition

The interface supports:

-   Range-based filtering
-   Multiple categorical selections
-   Paginated acquisition results
-   Representative seconds preview per acquisition

------------------------------------------------------------------------

### 🎥 Acquisition Visualization

Each 5-minute acquisition includes:

-   Metadata overview (location, context, weather)
-   Camera references (6 views + 360°)
-   Structured sensor data indicators
-   Downloadable dataset links
-   Per-second inspection capability

The Website allows users to inspect acquisition summaries before
accessing raw files.

------------------------------------------------------------------------

### 📦 Dataset & Media Access

Users can access:

-   CSV exports
-   MF4 measurement files
-   BLF binary logs
-   Video segments (AVI)
-   Per-second extracted images (JPG / PNG)

Downloads are served through links provided by the API.

------------------------------------------------------------------------

### 📁 Scenario Collections

Authenticated users can:

-   Create custom collections
-   Save specific moments (`acq_id + sec`)
-   Retrieve only seconds that contain downloadable assets
-   Organize research or evaluation scenarios

------------------------------------------------------------------------

### 🤖 LLM Experiment Interface

The Website integrates with the API's LLM experiment endpoints,
enabling:

-   Viewing stored LLM test results
-   Reviewing prompts and answers
-   Inspecting model metadata (tokens, latency)
-   Viewing evaluation scores

This supports interpretability benchmarking workflows.

------------------------------------------------------------------------

## 🛠 Tech Stack

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   REST API integration (Fastify backend)

------------------------------------------------------------------------

## 🔌 API Integration

Environment variable:

    VITE_API_BASE_URL=

Example:

    VITE_API_BASE_URL=https://your-api-domain.com

The Website consumes endpoints such as:

    GET /api/search
    GET /api/acquisition
    GET /videofiles
    POST /auth/login
    GET /collections

------------------------------------------------------------------------

## 🧱 Project Structure (Simplified)

-   `src/pages` -- Main views\
-   `src/components` -- UI components\
-   `src/services/api.ts` -- API integration layer\
-   `src/routes` -- Routing logic

------------------------------------------------------------------------

## 🚀 Running Locally

Install dependencies:

    npm install

Development:

    npm run dev

Production build:

    npm run build

Preview build:

    npm run preview

------------------------------------------------------------------------

## 🎯 Purpose

The CarCará Website transforms complex multimodal automotive data into
an accessible, searchable, and research-ready interface.

It bridges structured backend distribution with intuitive exploration
and download workflows, enabling:

-   Dataset discovery
-   Scenario inspection
-   Per-second moment retrieval
-   LLM experiment visualization

------------------------------------------------------------------------

## 📄 License

Define your license (MIT / Apache 2.0) or maintain as research
infrastructure.
