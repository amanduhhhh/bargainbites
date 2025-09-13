Bargain Bites — Coding Spec (rails + Mongoid + Cua + Gemini + Mongo Db)
Bargain Bites — Technical & Coding Specification

Goal: A Canadian web service that scrapes local grocery flyers, generates weekly recipes and a single consolidated shopping plan for users (target: broke college students & low-income families). Built in Ruby on Rails with MongoDB (Mongoid), uses CUA / headless automation for scraping flyer data where no API exists, Gemini for NLP/recipe/chatbot generation, and a minimalistic black & white UI with store accent color.

High-level architecture

Frontend (Rails + React)

Rails serves as API + authentication and server-side view fallback.

React (or Stimulus + Turbo) for the interactive parts: map, shopping planner, chatbot UI, recipe editor.

Minimalistic design system: black/white base + store accent color (mapping by store id).

Backend (Rails 7)

DB: MongoDB using mongoid gem (document model fits flyer JSON, OCR outputs, dynamic menus).

Background workers: Sidekiq (Redis) for scraping, OCR, recipe generation, route calculation.

CUA / headless automation service: separate microservice or worker that runs CUA agents to fetch flyers or navigates websites to gather PDFs/images.

Gemini API integration: for recipe generation, meal plan adjustments, chat assistant.

Map service: Mapbox (or Google Maps) for store locations, route planning, distance/time estimates.

Storage

MongoDB for structured data.

S3-compatible storage for flyer images, OCR outputs, temporary files.

Authentication

Email/password + OAuth (Google) + optional PC Optimum linking (if user has API / stakeholder partnership). Store credential tokens encrypted in DB.

Monitoring & Logging

Sentry for errors, Prometheus + Grafana for metrics.

Key subsystems & responsibilities

Flyer Scraper Pipeline

Input sources: store websites (PDF flyers, images), third-party flyer sites, uploaded images by users.

Tools: CUA agents to automate navigation when site has no API or anti-bot JS; fallback to headless Chromium (Puppeteer/Playwright) when possible.

OCR: Tesseract (or cloud OCR like Google Vision) to extract text from flyer images/PDFs.

Parsing: rule-based + ML entity extraction to find product names, prices, sizes, deal start/end dates, category tags.

Normalization: map scraped product text -> canonical product catalog entries (fuzzy match, tokenization). Maintain store-specific accent and metadata.

Scheduling: run nightly per region; Sidekiq cron jobs per retailer.

Product Catalogue

Lightweight product DB with fuzzy keys (name, category, weight, typical_price, unit_size). Keep it extensible; user overrides allowed.

Meal Planner / Recipe Generator

Given a budget, household size, constraints (allergies, cuisine preferences, dietary restrictions), and flyer deals, generate a 7-day meal plan.

Use Gemini to: propose recipes, scale ingredient quantities, substitute ingredients, output shopping lists mapped to store items.

Prompt engineering: include constraints (max cost, time per meal), use store-specific deals to swap ingredients.

Trip Optimizer

For a user's selected stores (or recommended cheapest set), compute:

Route ordering (TSP approximation with travel times)

Extra distance/time vs savings comparison (is the detour worth it)

Feasibility checks (walking vs car, how many people traveling, how many shopping trips allowed per week)

Carry capacity model (approx weight/volume estimates per item; if walking, cap by X kg/person; suggest multiple trips or pickup options)

Run optimization using mixed-integer programming (MIP) for combining cost minimization with travel/time constraints (or greedy + knapsack approximation for real-time speed).

Chatbot

Conversational UI backed by Gemini. Allows users to:

Ask to change meals, swap ingredients, tighten budget

Ask clarifying questions (allergies, preferences)

Re-run plan updates in real time

Maintain conversation state and meal plan deltas in MongoDB.

Map & UI

Embedded map showing nearby stores with accent color and cheapest deals indicator.

Minimalist black & white UI: lots of white space, mono typography, accent color used only for call-to-action and store highlights.

Data models (Mongoid documents)

Note: using Mongoid models in Rails, placed in app/models.

User
class User
  include Mongoid::Document
  include Mongoid::Timestamps


  field :email, type: String
  field :password_digest, type: String
  field :name, type: String
  field :home_location, type: Hash # { lat: , lng: , address: }
  field :household_size, type: Integer, default: 1
  field :car_available, type: Boolean, default: false
  field :walking_capacity_kg, type: Float, default: 15.0
  field :loyalty_cards, type: Array, default: [] # [{store: 'PC', token: 'xxxx'}]
  field :dietary_restrictions, type: Array, default: []
  field :preferred_cuisines, type: Array, default: []
  field :visit_frequency_days, type: Integer, default: 7
  field :region, type: String


  has_many :meal_plans
  has_many :shopping_trips
end
Flyer
class Flyer
  include Mongoid::Document
  include Mongoid::Timestamps


  field :store, type: String
  field :store_id, type: String
  field :published_at, type: Date
  field :valid_until, type: Date
  field :image_paths, type: Array
  field :source_url, type: String
  field :raw_text, type: String
  field :items, type: Array # [{product_name, price, unit, deal, parsed_product_id}]
  field :scraped_at, type: DateTime
end
Product
class Product
  include Mongoid::Document
  include Mongoid::Timestamps


  field :name, type: String
  field :aliases, type: Array, default: []
  field :category, type: String
  field :est_weight_g, type: Integer
  field :est_volume_l, type: Float
  field :canonical_unit, type: String
  field :tags, type: Array
  field :default_price_cents, type: Integer
end
MealPlan
class MealPlan
  include Mongoid::Document
  include Mongoid::Timestamps


  field :user_id, type: BSON::ObjectId
  field :week_start, type: Date
  field :recipes, type: Array # [{day: 'Mon', meal: 'dinner', recipe_id, servings, cost_cents}]
  field :total_cost_cents, type: Integer
  field :shopping_list, type: Array # [{product_id, qty, store_id, est_weight_g, price_cents}]
  field :notes, type: String
  field :status, type: String, default: 'generated'
end
ShoppingTrip
class ShoppingTrip
  include Mongoid::Document
  include Mongoid::Timestamps


  field :user_id, type: BSON::ObjectId
  field :stores_ordered, type: Array
  field :route_geojson, type: Hash
  field :total_distance_m, type: Integer
  field :total_time_s, type: Integer
  field :estimated_cost_cents, type: Integer
  field :feasible_on_foot, type: Boolean
  field :notes, type: String
end
Scraper & ingestion pipeline

Source registry: keeper of rules per-store: {store_id, base_url, flyer_pdf_path_pattern, requires_cua: true/false, scrape_frequency}

Fetcher (Sidekiq job): for each store ->

If requires_cua:

Trigger CUA Agent to navigate site, click 'download flyer' button, take screenshot or save PDF.

Save artifacts to S3 and create Flyer doc with metadata.

Else:

Use HTTP to fetch PDF or images directly; if JavaScript heavy, use Playwright.

OCR job: runs Tesseract or cloud OCR on saved images/PDF pages -> produce raw_text and token positions.

Parser job: rule-based + fuzzy match using trigram/fuzzywuzzy to extract (product, price, unit, deal_type) from text. Attach confidence score.

Normalization job: map extracted product strings to canonical Product entries (or create new product candidate).

Indexing job: index items into a search index (e.g., Elasticsearch or MongoDB text index) for quick lookups.

Anti-breakage: implement heuristics and alerting when parsing confidence dips below threshold; save raw artifacts for manual review.

Legal & ethics: store disclaimers. Respect robots.txt and terms of service; use CUA only to automate UI interactions where allowed. Provide rate limits and regional throttle.

Generating recipes with Gemini

Use cases: initial 7-day meal plan generation, recipe substitution, portion scaling, dynamic chat responses.

Prompt templates: Carefully craft prompts with explicit constraints: budget in cents, household size, time per meal, allergies, ingredients on sale (list from Flyer/items), preferred cuisines.

Example prompt skeleton:

You are a helpful recipe generator. The user: household_size=3, budget_week_cents=3000, allergies=[peanut], cuisine_preference=[south_asian]. Available discounted items: 1) Frozen peas 1kg @ $2 2) Chicken thighs 1kg @ $6 ...
Generate a 7-day meal plan (breakfast, lunch, dinner) with a short recipe for each dinner (ingredients, prep time, instructions), and a consolidated shopping list grouped by store. Minimize cost while meeting dietary restrictions, don't exceed budget.

Post-processing: parse Gemini output JSON (ask Gemini to output JSON schema) to the DB. If free-form, run a parser to convert to recipe objects.

Chatbot

Flow: user messages -> server -> Gemini completion with conversation history and current plan as context -> update MealPlan doc.

State: store conversation_id and turns, plus embeddings for retrieval if you want to ground answers in flyer facts.

Safety: sanitize user inputs and do not allow Gemini to suggest unsafe substitutions.

Trip optimization algorithm (detailed)

Problem statement: Choose a set of stores and a route so that shopping cost is minimized for the user's shopping list derived from the meal plan while ensuring travel/time/feasibility constraints.

Step 1 — Compute candidate store-item mapping

For each item in the shopping list, find cheapest store offering it (from Flyer items). Keep up to top-k candidate stores per item (k=3).

Step 2 — Build optimization model

Variables: x_{s} = 1 if store s visited, y_{i,s} = 1 if item i purchased at s.

Constraints:

sum_s y_{i,s} = qty_i (all qty must be bought)

y_{i,s} <= bigM * x_s

Travel/time budget if user has limited time

If on-foot: weight constraint: sum_items est_weight * qty <= walking_capacity_kg * num_people

Objective: minimize total_cost = sum_{i,s} price_{i,s}*qty_i + travel_cost_per_m * route_distance_m + inconvenience_penalty * number_of_stores

**Solvers &

Done — I put the full, detailed coding spec into a canvas document titled “Bargain Bites — Coding Spec (Rails + Mongoid + CUA + Gemini + MongoDB)” (you can see it in the canvas area).

Short summary of what’s in the doc:

Architecture and tech stack (Rails + Mongoid, Sidekiq, CUA / Playwright, Gemini, Mapbox/Google Maps, S3).

Mongoid document schemas for Users, Flyers, Products, MealPlans, ShoppingTrips.

Scraper pipeline (CUA agents for sites without APIs, headless Chromium fallback), OCR, parser, normalization, indexing.

Recipe generation approach and Gemini prompt templates + post-processing.

Trip optimization algorithm (MIP formulation + practical approximations, carry capacity, walking feasibility).

UI/UX minimal design system (black & white + store accent), key screens, routes.

Security/legal notes, Canadian-specific details (PC Optimum options, bilingual support), testing & deployment.

Endpoint listing, background job names, and example code snippets to get started.

If you want, I’ll now:

Scaffold the Rails repo (models, Sidekiq workers, basic API endpoints) and push code snippets into the canvas, or

Implement one concrete piece first (pick: CUA agent script for one store, a working ScrapeStoreJob, Gemini prompt library, or the trip-optimizer module).

Tell me which concrete next step you want and I’ll jump straight into coding it.

Know how many people are in my household. 

cooking experience level 

the amount of basic ingredients/ shelf staples I already have

the amount of money I want to spend per week

the equipment I have at home

take account of the expiration date 