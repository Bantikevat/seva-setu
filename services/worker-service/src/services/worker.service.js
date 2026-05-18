/**
 * WORKER SERVICE — Business Logic
 * -------------------------------------------------
 * Workers ka saara DB + business logic yahan.
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { getDistance } = require('../utils/distance');
const logger = require('../utils/logger');

const workerService = {
  /**
   * Sab categories nikalo
   */
  getAllCategories: async () => {
    const cats = db.getAllCategories();
    return cats.map((c) => ({
      id:        c.id,
      name:      c.name,
      nameHindi: c.name_hindi,
      emoji:     c.emoji,
      basePrice: c.base_price,
    }));
  },

  /**
   * Worker ka complete profile (with skills, reviews count)
   */
  getWorkerProfile: async (workerId) => {
    const worker = db.findWorkerById(workerId);
    if (!worker) return null;

    const skills  = db.getWorkerSkills(workerId);
    const reviews = db.getWorkerReviews(workerId);

    // Skills ke saath category info attach karo
    const skillsWithCategory = skills.map((s) => {
      const cat = db.findCategoryById(s.category_id);
      return {
        id:              s.id,
        categoryId:      s.category_id,
        categoryName:    cat?.name || 'Unknown',
        categoryEmoji:   cat?.emoji || '🔧',
        experienceYears: s.experience_years,
        isPrimary:       s.is_primary,
      };
    });

    return {
      id:           worker.id,
      phone:        worker.phone,
      name:         worker.name,
      bio:          worker.bio,
      profilePhoto: worker.profile_photo,
      isVerified:   worker.is_verified,
      isAvailable:  worker.is_available,
      isActive:     worker.is_active,
      ratingAverage: worker.rating_average,
      totalJobs:     worker.total_jobs,
      totalEarnings: worker.total_earnings,
      latitude:      worker.latitude,
      longitude:     worker.longitude,
      skills:        skillsWithCategory,
      reviewsCount:  reviews.length,
      joinedAt:      worker.joined_at,
    };
  },

  /**
   * Worker registration
   */
  register: async (data) => {
    // Phone se check karo
    if (db.findWorkerByPhone(data.phone)) {
      return { error: 'PHONE_EXISTS' };
    }

    const worker = {
      id:             uuidv4(),
      phone:          data.phone,
      name:           data.name,
      bio:            data.bio          || null,
      profile_photo:  data.profilePhoto || null,
      aadhaar_url:    data.aadhaarUrl   || null,
      latitude:       data.latitude     || null,
      longitude:      data.longitude    || null,
      city_id:        data.cityId       || null,
      is_verified:    false,            // Admin verify karega
      is_available:   true,
      is_active:      true,
      rating_average: 0,
      total_jobs:     0,
      total_earnings: 0,
      joined_at:      new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    };

    db.createWorker(worker);
    logger.info(`New worker registered: ${worker.id} (${worker.name})`);

    return { worker };
  },

  /**
   * Update profile
   */
  updateProfile: async (workerId, updates) => {
    const dbUpdates = {
      name:          updates.name,
      bio:           updates.bio,
      profile_photo: updates.profilePhoto,
      aadhaar_url:   updates.aadhaarUrl,
      latitude:      updates.latitude,
      longitude:     updates.longitude,
      city_id:       updates.cityId,
    };

    const updated = db.updateWorker(workerId, dbUpdates);
    if (!updated) return null;

    return await workerService.getWorkerProfile(workerId);
  },

  /**
   * Available/Busy toggle
   */
  toggleAvailability: async (workerId, isAvailable) => {
    const updated = db.updateWorker(workerId, { is_available: !!isAvailable });
    if (!updated) return null;
    return { isAvailable: updated.is_available };
  },

  /**
   * Add skill
   */
  addSkill: async (workerId, categoryId, experienceYears, isPrimary = false) => {
    // Category exists?
    const category = db.findCategoryById(categoryId);
    if (!category) return { error: 'CATEGORY_NOT_FOUND' };

    // Already exists?
    const existing = db.getWorkerSkills(workerId).find(
      (s) => s.category_id === categoryId
    );
    if (existing) return { error: 'SKILL_EXISTS' };

    const skill = {
      id:               uuidv4(),
      worker_id:        workerId,
      category_id:      categoryId,
      experience_years: experienceYears || 1,
      is_primary:       isPrimary,
      created_at:       new Date().toISOString(),
    };

    db.addWorkerSkill(skill);
    return { skill };
  },

  /**
   * Remove skill
   */
  removeSkill: async (workerId, skillId) => {
    const skills = db.getWorkerSkills(workerId);
    const skill = skills.find((s) => s.id === skillId);

    if (!skill) return { error: 'NOT_FOUND' };
    if (skill.worker_id !== workerId) return { error: 'FORBIDDEN' };

    db.removeWorkerSkill(skillId);
    return { success: true };
  },

  /**
   * SEARCH WORKERS — main business logic
   *
   * filters: { category, minRating, available, verified, maxPrice }
   * userLocation: { lat, lng }  → for distance sort
   * sort: 'rating' | 'distance' | 'price' | 'jobs'
   */
  search: async (filters = {}, userLocation = {}, sort = 'rating') => {
    let workers = db.getAllWorkers().filter((w) => w.is_active);

    // Filter by category
    if (filters.category) {
      const cat = db.findCategoryByName(filters.category);
      if (cat) {
        const categoryWorkers = db.getWorkersByCategoryId(cat.id);
        const ids = categoryWorkers.map((w) => w.id);
        workers = workers.filter((w) => ids.includes(w.id));
      }
    }

    // Filter by rating
    if (filters.minRating) {
      workers = workers.filter((w) => w.rating_average >= filters.minRating);
    }

    // Filter by availability
    if (filters.available) {
      workers = workers.filter((w) => w.is_available);
    }

    // Filter by verified
    if (filters.verified) {
      workers = workers.filter((w) => w.is_verified);
    }

    // Enrich with skills + distance
    const enriched = workers.map((w) => {
      const skills = db.getWorkerSkills(w.id);
      const primarySkill = skills.find((s) => s.is_primary) || skills[0];
      const category = primarySkill ? db.findCategoryById(primarySkill.category_id) : null;

      const distance = userLocation.lat && userLocation.lng && w.latitude && w.longitude
        ? getDistance(userLocation.lat, userLocation.lng, w.latitude, w.longitude)
        : null;

      return {
        id:            w.id,
        name:          w.name,
        profilePhoto:  w.profile_photo,
        ratingAverage: w.rating_average,
        totalJobs:     w.total_jobs,
        isVerified:    w.is_verified,
        isAvailable:   w.is_available,
        latitude:      w.latitude,
        longitude:     w.longitude,
        skill:         category?.name || 'General',
        skillEmoji:    category?.emoji || '🔧',
        pricePerVisit: category?.base_price || 299,
        experienceYears: primarySkill?.experience_years || 0,
        distanceKm:    distance,
      };
    });

    // Apply max price filter (after enrich since price comes from category)
    let filtered = enriched;
    if (filters.maxPrice) {
      filtered = filtered.filter((w) => w.pricePerVisit <= filters.maxPrice);
    }

    // Sort
    if (sort === 'rating') {
      filtered.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } else if (sort === 'distance' && userLocation.lat) {
      filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (sort === 'price') {
      filtered.sort((a, b) => a.pricePerVisit - b.pricePerVisit);
    } else if (sort === 'jobs') {
      filtered.sort((a, b) => b.totalJobs - a.totalJobs);
    }

    return {
      workers: filtered,
      count:   filtered.length,
      filters,
      sort,
    };
  },
};

module.exports = workerService;
