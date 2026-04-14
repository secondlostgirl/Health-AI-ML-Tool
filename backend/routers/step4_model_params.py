# routers/step4_model_params.py
import warnings
import numpy as np
from fastapi import APIRouter, HTTPException, Header
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, _tree as sk_tree
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix as sk_confusion_matrix,
    roc_auc_score, roc_curve as sk_roc_curve,
)

from services import session_store
from services.prep_service import prepare_data
from models.schemas import (
    TrainRequest, TrainResponse,
    SVMParams, RandomForestParams,
    KNNParams, DecisionTreeParams, LogisticRegressionParams, NaiveBayesParams,
)

router = APIRouter(prefix="/api/step4", tags=["Step 4 - Model & Parameters"])

SUPPORTED_MODELS = {
    "svm", "random_forest", "knn", "decision_tree", "logistic_regression", "naive_bayes"
}


# ── Training helpers ──────────────────────────────────────────────────────────

def _train_svm(X_train, y_train, raw_params: dict):
    """US-011: SVM Kernel Selection Tuning."""
    try:
        p = SVMParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid SVM params: {exc}")

    if p.kernel not in {"linear", "rbf", "poly", "sigmoid"}:
        raise HTTPException(status_code=422, detail=f"Invalid kernel '{p.kernel}'. Choose 'linear', 'rbf', 'poly', or 'sigmoid'.")
    if p.C <= 0:
        raise HTTPException(status_code=422, detail=f"C must be > 0 (got {p.C}).")

    model_kwargs = {"kernel": p.kernel, "C": p.C, "probability": True}
    if p.kernel in {"rbf", "poly", "sigmoid"}:
        model_kwargs["gamma"] = p.gamma
    model = SVC(**model_kwargs)
    params_used = {k: v for k, v in model_kwargs.items() if k != "probability"}
    return model, params_used


def _train_random_forest(X_train, y_train, raw_params: dict):
    """US-012: Random Forest Tree Count Tuning."""
    try:
        p = RandomForestParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid Random Forest params: {exc}")

    if not (1 <= p.n_estimators <= 1000):
        raise HTTPException(status_code=422, detail=f"n_estimators must be 1–1000 (got {p.n_estimators}).")

    model = RandomForestClassifier(
        n_estimators=p.n_estimators,
        max_depth=p.max_depth,
        random_state=p.random_state,
    )
    params_used = {"n_estimators": p.n_estimators, "max_depth": p.max_depth, "random_state": p.random_state}
    return model, params_used


def _train_knn(X_train, y_train, raw_params: dict):
    """KNN: K-Nearest Neighbors classifier."""
    try:
        p = KNNParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid KNN params: {exc}")

    if not (1 <= p.n_neighbors <= 25):
        raise HTTPException(status_code=422, detail=f"n_neighbors must be 1–25 (got {p.n_neighbors}).")
    if p.n_neighbors > len(X_train):
        raise HTTPException(status_code=422, detail=f"n_neighbors ({p.n_neighbors}) cannot exceed training set size ({len(X_train)}).")
    if p.metric not in {"euclidean", "manhattan", "minkowski"}:
        raise HTTPException(status_code=422, detail=f"Invalid metric '{p.metric}'.")

    model = KNeighborsClassifier(n_neighbors=p.n_neighbors, metric=p.metric)
    params_used = {"n_neighbors": p.n_neighbors, "metric": p.metric}
    return model, params_used


def _train_decision_tree(X_train, y_train, raw_params: dict):
    """Decision Tree classifier."""
    try:
        p = DecisionTreeParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid Decision Tree params: {exc}")

    if not (1 <= p.max_depth <= 20):
        raise HTTPException(status_code=422, detail=f"max_depth must be 1–20 (got {p.max_depth}).")
    if p.criterion not in {"gini", "entropy"}:
        raise HTTPException(status_code=422, detail=f"Invalid criterion '{p.criterion}'.")
    if not (2 <= p.min_samples_split <= 20):
        raise HTTPException(status_code=422, detail=f"min_samples_split must be 2–20 (got {p.min_samples_split}).")

    model = DecisionTreeClassifier(
        max_depth=p.max_depth,
        criterion=p.criterion,
        min_samples_split=p.min_samples_split,
        random_state=42,
    )
    params_used = {"max_depth": p.max_depth, "criterion": p.criterion, "min_samples_split": p.min_samples_split}
    return model, params_used


def _train_logistic_regression(X_train, y_train, raw_params: dict):
    """Logistic Regression classifier."""
    try:
        p = LogisticRegressionParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid Logistic Regression params: {exc}")

    if p.C <= 0:
        raise HTTPException(status_code=422, detail=f"C must be > 0 (got {p.C}).")
    if p.solver not in {"lbfgs", "liblinear", "saga"}:
        raise HTTPException(status_code=422, detail=f"Invalid solver '{p.solver}'.")
    if not (10 <= p.max_iter <= 1000):
        raise HTTPException(status_code=422, detail=f"max_iter must be 10–1000 (got {p.max_iter}).")

    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=UserWarning)
        model = LogisticRegression(C=p.C, solver=p.solver, max_iter=p.max_iter, random_state=42)
    params_used = {"C": p.C, "solver": p.solver, "max_iter": p.max_iter}
    return model, params_used


def _train_naive_bayes(X_train, y_train, raw_params: dict):
    """Gaussian Naive Bayes classifier."""
    try:
        p = NaiveBayesParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid Naive Bayes params: {exc}")

    if p.var_smoothing <= 0:
        raise HTTPException(status_code=422, detail=f"var_smoothing must be > 0 (got {p.var_smoothing}).")

    model = GaussianNB(var_smoothing=p.var_smoothing)
    params_used = {"var_smoothing": p.var_smoothing}
    return model, params_used


# ── Visualization helpers ─────────────────────────────────────────────────────

def _top2_idx(X: np.ndarray):
    """Return indices of the 2 best features for visualization.
    Strongly prefers continuous features over binary/low-cardinality ones.
    """
    n_features = X.shape[1]
    if n_features < 2:
        return 0, 0

    variances = np.var(X, axis=0)
    # Count unique values per feature
    unique_counts = np.array([len(np.unique(X[:, i])) for i in range(n_features)])

    # Heavily penalise binary / near-binary features for visualization
    adjusted_var = variances.copy()
    for i in range(n_features):
        if unique_counts[i] <= 2:
            adjusted_var[i] *= 0.001   # binary penalty
        elif unique_counts[i] <= 5:
            adjusted_var[i] *= 0.1     # low-cardinality penalty

    idx = np.argsort(adjusted_var)[::-1]
    i0, i1 = int(idx[0]), int(idx[1])

    # If both top features are still binary (all continuous features missing),
    # fall back to the two highest-variance features regardless
    if unique_counts[i0] <= 2 and unique_counts[i1] <= 2:
        fallback = np.argsort(variances)[::-1]
        i0, i1 = int(fallback[0]), int(fallback[1])

    return i0, i1


def _safe_float(v):
    """Convert to float, handling NaN/Inf gracefully."""
    try:
        f = float(v)
        return 0.0 if (np.isnan(f) or np.isinf(f)) else round(f, 6)
    except Exception:
        return 0.0


def _sanitize(obj):
    """Recursively convert numpy scalars to Python primitives for JSON serialization."""
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        f = float(obj)
        return 0.0 if (np.isnan(f) or np.isinf(f)) else f
    if isinstance(obj, np.ndarray):
        return _sanitize(obj.tolist())
    return obj


def _compute_visualization(
    model, model_name: str,
    X_train: np.ndarray, X_test: np.ndarray,
    y_train, y_test,
    feature_cols: list, params_used: dict, class_labels: list,
) -> dict:
    """Compute model-specific visualization data after training."""
    try:
        n_features = X_train.shape[1]
        i0, i1 = _top2_idx(X_train)
        feat0 = feature_cols[i0] if i0 < len(feature_cols) else f"Feature {i0}"
        feat1 = feature_cols[i1] if i1 < len(feature_cols) else f"Feature {i1}"
        is_binary = len(class_labels) == 2
        pos_class = class_labels[-1] if is_binary else class_labels[0]

        if model_name == "knn":
            return _viz_knn(model, X_train, y_train, i0, i1, feat0, feat1, params_used, class_labels, pos_class)
        elif model_name == "svm":
            return _viz_svm(model, X_train, y_train, i0, i1, feat0, feat1, n_features, class_labels, pos_class)
        elif model_name == "decision_tree":
            return _viz_decision_tree(model, X_train, y_train, feature_cols, class_labels, params_used)
        elif model_name == "random_forest":
            return _viz_random_forest(model, X_test, y_test, class_labels, pos_class, params_used)
        elif model_name == "logistic_regression":
            return _viz_logistic_regression(model, X_train, i0, i1, feat0, feat1, n_features, feature_cols, class_labels, pos_class, params_used)
        elif model_name == "naive_bayes":
            return _viz_naive_bayes(model, X_test, feature_cols, class_labels, pos_class)
    except Exception as e:
        # Visualization failure must not break training response
        return {"type": model_name, "error": str(e)}

    return {"type": model_name}


def _safe_viz(viz: dict) -> dict:
    """Sanitize all numpy types in the visualization dict before returning."""
    return _sanitize(viz)


def _viz_knn(model, X_train, y_train, i0, i1, feat0, feat1, params_used, class_labels, pos_class):
    rng = np.random.RandomState(42)
    n = len(X_train)
    max_pts = 150
    if n > max_pts:
        idx = rng.choice(n, max_pts, replace=False)
        X2d = X_train[idx][:, [i0, i1]]
        labels = y_train[idx] if hasattr(y_train, '__getitem__') else np.array(y_train)[idx]
    else:
        X2d = X_train[:, [i0, i1]]
        labels = np.array(y_train)

    X2d = X2d.copy().astype(float)
    labels = np.array(labels)

    # Normalize to [0, 1] for consistent SVG coordinates
    for col in range(2):
        mn, mx = X2d[:, col].min(), X2d[:, col].max()
        if mx > mn:
            X2d[:, col] = (X2d[:, col] - mn) / (mx - mn)

    # Query point = centroid of positive class in 2D
    pos_mask = labels == pos_class
    if pos_mask.any():
        qx, qy = float(X2d[pos_mask, 0].mean()), float(X2d[pos_mask, 1].mean())
    else:
        qx, qy = 0.5, 0.5

    # Distances from query to scatter points
    dists = np.sqrt((X2d[:, 0] - qx) ** 2 + (X2d[:, 1] - qy) ** 2)
    k = params_used.get("n_neighbors", 5)
    sorted_idx = np.argsort(dists)
    neighbor_set = set(sorted_idx[:k].tolist())
    raw_radius = float(dists[sorted_idx[k - 1]]) if k <= len(dists) else float(dists.max())
    # Clamp so circle never goes far outside the [0,1] plot area
    radius = min(raw_radius, 0.42)

    scatter = [
        {
            "x": _safe_float(X2d[j, 0]),
            "y": _safe_float(X2d[j, 1]),
            "label": str(labels[j]),
            "is_neighbor": bool(j in neighbor_set),
        }
        for j in range(len(X2d))
    ]

    return {
        "type": "knn",
        "feature_names": [feat0, feat1],
        "scatter_points": scatter,
        "query_point": {"x": _safe_float(qx), "y": _safe_float(qy)},
        "radius": _safe_float(radius),
        "k": k,
        "class_labels": class_labels,
        "pos_class": str(pos_class),
        "clinical_meaning": (
            f"The KNN model identifies the {k} most similar patients to the query patient "
            f"based on {feat0} and {feat1}. The majority class among these neighbors determines the prediction."
        ),
    }


def _viz_svm(model, X_train, y_train, i0, i1, feat0, feat1, n_features, class_labels, pos_class):
    rng = np.random.RandomState(42)
    n = len(X_train)
    max_pts = 150
    if n > max_pts:
        idx = rng.choice(n, max_pts, replace=False)
        X2d = X_train[idx][:, [i0, i1]].copy()
        labels = np.array(y_train)[idx]
    else:
        X2d = X_train[:, [i0, i1]].copy()
        labels = np.array(y_train)
        idx = np.arange(n)

    # Normalize to [0, 1]
    col_min = X2d.min(axis=0)
    col_range = X2d.max(axis=0) - X2d.min(axis=0)
    col_range[col_range == 0] = 1.0
    X2d = (X2d - col_min) / col_range

    # Decision boundary via mesh grid (30x30)
    xs = np.linspace(0, 1, 30)
    ys = np.linspace(0, 1, 30)
    means = X_train.mean(axis=0)
    boundary_points = []
    try:
        grid_vals = np.zeros((30, 30))
        for xi, xv in enumerate(xs):
            rows = np.tile(means, (30, 1))
            rows[:, i0] = xv * col_range[0] + col_min[0]
            for yi, yv in enumerate(ys):
                rows[yi, i1] = yv * col_range[1] + col_min[1]
            dec = model.decision_function(rows)
            # For multiclass SVM, decision_function returns multiple columns; use first
            dec_1d = dec[:, 0] if dec.ndim > 1 else dec
            for yi in range(30):
                grid_vals[xi, yi] = dec_1d[yi]

        # Find zero crossings
        for xi in range(29):
            for yi in range(29):
                v00 = grid_vals[xi, yi]
                v10 = grid_vals[xi + 1, yi]
                v01 = grid_vals[xi, yi + 1]
                if v00 * v10 < 0:  # horizontal crossing
                    t = v00 / (v00 - v10)
                    boundary_points.append({"x": _safe_float(xs[xi] + t / 29), "y": _safe_float(ys[yi])})
                if v00 * v01 < 0:  # vertical crossing
                    t = v00 / (v00 - v01)
                    boundary_points.append({"x": _safe_float(xs[xi]), "y": _safe_float(ys[yi] + t / 29)})
        # Sort into a smooth path using nearest-neighbour chain
        if len(boundary_points) > 2:
            ordered = [boundary_points.pop(0)]
            while boundary_points:
                last = ordered[-1]
                dists_bp = [(abs(p["x"] - last["x"]) + abs(p["y"] - last["y"]), i)
                            for i, p in enumerate(boundary_points)]
                _, nearest = min(dists_bp)
                ordered.append(boundary_points.pop(nearest))
            boundary_points = ordered[:60]
    except Exception:
        boundary_points = []

    # Mark support vectors (support_ contains indices into X_train)
    try:
        sv_set = set(model.support_.tolist())
        scatter_sv = [bool(int(idx[j]) in sv_set) for j in range(len(X2d))]
    except Exception:
        scatter_sv = [False] * len(X2d)

    scatter = [
        {
            "x": _safe_float(X2d[j, 0]),
            "y": _safe_float(X2d[j, 1]),
            "label": str(labels[j]),
            "is_support_vector": bool(scatter_sv[j]),
        }
        for j in range(len(X2d))
    ]

    kernel = model.kernel if hasattr(model, "kernel") else "rbf"
    return {
        "type": "svm",
        "feature_names": [feat0, feat1],
        "scatter_points": scatter,
        "decision_boundary": boundary_points,
        "class_labels": class_labels,
        "pos_class": str(pos_class),
        "clinical_meaning": (
            f"The {kernel.upper()} kernel SVM draws a boundary separating patients by {feat0} and {feat1}. "
            f"Patients on the boundary (support vectors, outlined) are the most critical cases."
        ),
    }


def _viz_decision_tree(model, X_train, y_train, feature_cols, class_labels, params_used):
    tree = model.tree_
    max_export_depth = 5

    def recurse(node_id, parent_id, depth):
        if depth > max_export_depth:
            return []
        feat_idx = int(tree.feature[node_id])
        thresh = float(tree.threshold[node_id])
        is_leaf = bool(feat_idx == sk_tree.TREE_UNDEFINED)
        values = [int(v) for v in tree.value[node_id][0]]
        pred_class_idx = int(np.argmax(values))
        node = {
            "id": int(node_id),
            "parent_id": int(parent_id) if parent_id is not None else None,
            "depth": int(depth),
            "feature": feature_cols[feat_idx] if not is_leaf and feat_idx < len(feature_cols) else None,
            "threshold": round(thresh, 4) if not is_leaf else None,
            "gini": round(float(tree.impurity[node_id]), 4),
            "samples": int(tree.n_node_samples[node_id]),
            "values": values,
            "is_leaf": is_leaf,
            "left_child": int(tree.children_left[node_id]) if not is_leaf else None,
            "right_child": int(tree.children_right[node_id]) if not is_leaf else None,
            "predicted_class_idx": pred_class_idx,
            "predicted_class": class_labels[pred_class_idx] if pred_class_idx < len(class_labels) else str(pred_class_idx),
            "probability": round(float(values[pred_class_idx] / max(sum(values), 1)), 4),
        }
        nodes = [node]
        if not is_leaf:
            nodes += recurse(int(tree.children_left[node_id]), int(node_id), depth + 1)
            nodes += recurse(int(tree.children_right[node_id]), int(node_id), depth + 1)
        return nodes

    nodes = recurse(0, None, 0)
    root_feat_idx = int(tree.feature[0])
    root_feature = feature_cols[root_feat_idx] if root_feat_idx < len(feature_cols) else f"Feature {root_feat_idx}"

    # Model confidence = highest leaf probability
    leaf_probs = [n["probability"] for n in nodes if n["is_leaf"]]
    model_confidence = round(max(leaf_probs), 4) if leaf_probs else 0.0

    return {
        "type": "decision_tree",
        "nodes": nodes,
        "max_depth_used": int(model.get_depth()),
        "total_nodes": int(tree.node_count),
        "gini_root": round(float(tree.impurity[0]), 4),
        "model_confidence": model_confidence,
        "class_labels": class_labels,
        "clinical_meaning": (
            f"The tree first splits on {root_feature}, the strongest clinical predictor. "
            f"Follow YES/NO branches to reach a prediction at each leaf node."
        ),
    }


def _viz_random_forest(model, X_test, y_test, class_labels, pos_class, params_used):
    if len(X_test) == 0:
        return {"type": "random_forest", "error": "No test data available"}

    query = X_test[0:1]
    verdicts = []
    for tree in model.estimators_:
        pred = tree.predict(query)[0]
        verdicts.append(1 if str(pred) == str(pos_class) else 0)

    verdicts_display = verdicts[:100]
    n_readmit = sum(verdicts_display)
    n_safe = len(verdicts_display) - n_readmit
    total_shown = len(verdicts_display) or 1
    # Consistency = how strongly the majority side dominates (regardless of which class)
    majority_share = max(n_readmit, n_safe) / total_shown

    if majority_share > 0.70:
        consistency = "HIGH"
    elif majority_share > 0.55:
        consistency = "MEDIUM"
    else:
        consistency = "LOW"

    neg_class = class_labels[0] if len(class_labels) >= 2 else "Safe"
    votes = {str(pos_class): n_readmit, str(neg_class): n_safe}

    return {
        "type": "random_forest",
        "n_trees": len(model.estimators_),
        "votes": votes,
        "ensemble_consistency": consistency,
        "tree_verdicts": verdicts_display,
        "class_labels": class_labels,
        "pos_class": str(pos_class),
        "clinical_meaning": (
            f"{n_readmit} out of {len(verdicts_display)} trees predict {pos_class} for this patient. "
            f"Ensemble Consistency: {consistency} — {'majority vote is clear.' if consistency == 'HIGH' else 'prediction is less certain.'}"
        ),
    }


def _viz_logistic_regression(model, X_train, i0, i1, feat0, feat1, n_features, feature_cols, class_labels, pos_class, params_used):
    coef = model.coef_[0] if hasattr(model, "coef_") else np.zeros(n_features)
    intercept = float(model.intercept_[0]) if hasattr(model, "intercept_") else 0.0
    best_idx = int(np.argmax(np.abs(coef)))
    best_feat = feat0 if best_idx == i0 else (feat1 if best_idx == i1 else (
        feature_cols[best_idx] if best_idx < len(feature_cols) else f"Feature {best_idx}"
    ))

    means = X_train.mean(axis=0)
    pos_class_idx = class_labels.index(pos_class) if pos_class in class_labels else -1

    x_vals = np.linspace(0, 1, 60)
    rows = np.tile(means, (60, 1))
    rows[:, best_idx] = x_vals

    try:
        probs = model.predict_proba(rows)
        if pos_class_idx >= 0 and pos_class_idx < probs.shape[1]:
            y_vals = probs[:, pos_class_idx]
        else:
            y_vals = probs[:, -1]
    except Exception:
        # Fallback: compute sigmoid manually
        linear = intercept + coef[best_idx] * x_vals
        y_vals = 1 / (1 + np.exp(-linear))

    sigmoid_curve = [{"x": _safe_float(x_vals[i]), "y": _safe_float(y_vals[i])} for i in range(60)]

    # Threshold where P(pos) = 0.5
    try:
        if abs(coef[best_idx]) > 1e-10:
            x_thresh = -intercept / coef[best_idx]
            # Adjust for feature scaling: x_thresh is in original space, normalize to [0,1]
            x_thresh_norm = float(np.clip(x_thresh, 0, 1))
        else:
            x_thresh_norm = 0.5
    except Exception:
        x_thresh_norm = 0.5

    # Y value at threshold
    rows_thresh = means.copy().reshape(1, -1)
    rows_thresh[0, best_idx] = x_thresh_norm
    try:
        y_thresh = float(model.predict_proba(rows_thresh)[0, -1 if pos_class_idx < 0 else pos_class_idx])
    except Exception:
        y_thresh = 0.5

    feat_display = best_feat.replace("_", " ").title()
    threshold_label = f"{feat_display}={x_thresh_norm:.2f} → 50% Risk"

    return {
        "type": "logistic_regression",
        "feature_name": best_feat,
        "sigmoid_curve": sigmoid_curve,
        "threshold_point": {"x": _safe_float(x_thresh_norm), "y": _safe_float(y_thresh), "label": threshold_label},
        "solver": params_used.get("solver", "lbfgs"),
        "penalty": "l2",
        "class_labels": class_labels,
        "pos_class": str(pos_class),
        "clinical_meaning": (
            f"The S-curve shows how {best_feat.replace('_',' ')} drives readmission probability. "
            f"At {feat_display}={x_thresh_norm:.2f}, the model predicts 50% risk — the clinical decision threshold."
        ),
    }


def _viz_naive_bayes(model, X_test, feature_cols, class_labels, pos_class):
    if len(X_test) == 0:
        return {"type": "naive_bayes", "error": "No test data available"}

    query = X_test[0]
    pos_class_idx = class_labels.index(pos_class) if pos_class in class_labels else -1
    neg_class_idx = 1 - pos_class_idx if pos_class_idx in (0, 1) else 0

    theta = model.theta_   # shape (n_classes, n_features)
    var = model.var_       # shape (n_classes, n_features)

    def log_gaussian(x, mean, variance):
        variance = max(float(variance), 1e-12)
        return -0.5 * np.log(2 * np.pi * variance) - (x - mean) ** 2 / (2 * variance)

    n_feat = min(len(feature_cols), theta.shape[1])
    log_ratios = []
    for i in range(n_feat):
        lp_pos = log_gaussian(query[i], theta[pos_class_idx, i], var[pos_class_idx, i])
        lp_neg = log_gaussian(query[i], theta[neg_class_idx, i], var[neg_class_idx, i])
        log_ratios.append(float(lp_pos - lp_neg))

    total_abs = sum(abs(lr) for lr in log_ratios)
    if total_abs < 1e-10:
        total_abs = 1.0

    features_sorted = sorted(
        range(n_feat),
        key=lambda i: abs(log_ratios[i]),
        reverse=True,
    )[:8]  # Top 8 features

    features_data = []
    for i in features_sorted:
        lr = log_ratios[i]
        pct = round(abs(lr) / total_abs * 100, 1)
        feat_name = feature_cols[i].replace("_", " ").title() if i < len(feature_cols) else f"Feature {i}"
        features_data.append({
            "name": feat_name,
            "raw_name": feature_cols[i] if i < len(feature_cols) else f"Feature {i}",
            "value": _safe_float(float(query[i])),
            "log_ratio": _safe_float(lr),
            "direction": "increases" if lr > 0 else "decreases",
            "percentage": pct,
        })

    try:
        final_prob = float(model.predict_proba(query.reshape(1, -1))[0, pos_class_idx if pos_class_idx >= 0 else -1])
    except Exception:
        final_prob = 0.5

    final_pct = round(final_prob * 100, 1)
    final_class = str(pos_class) if final_prob >= 0.5 else (class_labels[neg_class_idx] if neg_class_idx >= 0 else class_labels[0])

    top_feat = features_data[0]["name"] if features_data else "Unknown feature"

    return {
        "type": "naive_bayes",
        "features": features_data,
        "final_probability": _safe_float(final_prob),
        "final_class": final_class,
        "final_percentage": final_pct,
        "class_labels": class_labels,
        "pos_class": str(pos_class),
        "clinical_meaning": (
            f"Naïve Bayes treats each measurement independently. "
            f"{top_feat} is the strongest risk factor for this patient. "
            f"Final combined probability: {final_pct}% {final_class}."
        ),
    }


# ── Main endpoint ─────────────────────────────────────────────────────────────

@router.post(
    "/train",
    response_model=TrainResponse,
    summary="Train a model with selected parameters (US-011, US-012)",
)
def train_model(
    request: TrainRequest,
    x_session_id: str = Header(...),
):
    """
    Trains the selected model using the prepared data from Step 3.

    **Gate**: Requires prep_complete = True (Step 3 must be finished first).

    Supported models: svm, random_forest, knn, decision_tree, logistic_regression, naive_bayes
    """
    session = session_store.get(x_session_id)

    if not session.get("prep_complete", False):
        raise HTTPException(
            status_code=403,
            detail=(
                "Step 4 is locked. Please complete Data Preparation in Step 3 "
                "before training a model."
            ),
        )

    if request.model not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported model '{request.model}'. Choose from: {sorted(SUPPORTED_MODELS)}",
        )

    # ── Re-prepare data from session ──────────────────────────────────────────
    df = session.get("df_raw")
    target_col = session.get("target_column")
    feature_cols = session.get("feature_columns")
    prep_req = session.get("prep_request")

    if df is None or not target_col or not feature_cols or prep_req is None:
        raise HTTPException(
            status_code=400,
            detail="Session data incomplete. Please complete Steps 2 and 3 first.",
        )

    from services.prep_service import prepare_data as _prep
    _prep(df, target_col, feature_cols, prep_req)

    from services.train_service import get_splits
    X_train, X_test, y_train, y_test = get_splits(df, target_col, feature_cols, prep_req)

    # ── Validate target is categorical ────────────────────────────────────────
    n_unique = len(np.unique(y_train))
    if n_unique > 20:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Target column '{target_col}' has {n_unique} unique values and "
                f"appears to be continuous. Classification models require a "
                f"categorical target."
            ),
        )

    # ── Build model ───────────────────────────────────────────────────────────
    dispatch = {
        "svm": _train_svm,
        "random_forest": _train_random_forest,
        "knn": _train_knn,
        "decision_tree": _train_decision_tree,
        "logistic_regression": _train_logistic_regression,
        "naive_bayes": _train_naive_bayes,
    }
    model, params_used = dispatch[request.model](X_train, y_train, request.params)

    try:
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore")
            model.fit(X_train, y_train)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Training failed: {exc}")

    # ── Evaluate ──────────────────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    unique_vals = sorted(np.unique(np.concatenate([y_train, y_test])).tolist())
    class_labels = [str(c) for c in unique_vals]
    is_binary = len(class_labels) == 2
    avg = "binary" if is_binary else "weighted"
    # pos_lbl must match the actual dtype in y_test (int, float, or str)
    pos_lbl = unique_vals[-1] if is_binary else None

    accuracy  = round(float(accuracy_score(y_test, y_pred)), 4)
    precision = round(float(precision_score(y_test, y_pred, average=avg, pos_label=pos_lbl, zero_division=0)), 4)
    recall    = round(float(recall_score(y_test, y_pred, average=avg, pos_label=pos_lbl, zero_division=0)), 4)
    f1        = round(float(f1_score(y_test, y_pred, average=avg, pos_label=pos_lbl, zero_division=0)), 4)
    cm        = sk_confusion_matrix(y_test, y_pred).tolist()

    # ── Specificity ───────────────────────────────────────────────────────────
    specificity_val = None
    try:
        cm_arr = np.array(cm)
        if cm_arr.shape == (2, 2):
            tn, fp = cm_arr[0, 0], cm_arr[0, 1]
            specificity_val = round(float(tn / (tn + fp)), 4) if (tn + fp) > 0 else 0.0
        else:
            spec_sum, weight_sum = 0.0, 0.0
            for i in range(cm_arr.shape[0]):
                tp_i = cm_arr[i, i]
                fp_i = cm_arr[:, i].sum() - tp_i
                tn_i = cm_arr.sum() - cm_arr[i, :].sum() - cm_arr[:, i].sum() + tp_i
                denom = tn_i + fp_i
                spec_i = tn_i / denom if denom > 0 else 0.0
                class_count = cm_arr[i, :].sum()
                spec_sum += spec_i * class_count
                weight_sum += class_count
            specificity_val = round(float(spec_sum / weight_sum), 4) if weight_sum > 0 else 0.0
    except Exception:
        specificity_val = None

    # ── AUC & ROC ─────────────────────────────────────────────────────────────
    auc_val = None
    roc_curve_data = None
    try:
        y_proba = model.predict_proba(X_test)
        if is_binary:
            auc_val = round(float(roc_auc_score(y_test, y_proba[:, 1], labels=sorted(np.unique(y_test)))), 4)
            fpr, tpr, _ = sk_roc_curve(y_test, y_proba[:, 1], pos_label=pos_lbl)
            roc_curve_data = {
                "fpr": [round(float(v), 4) for v in fpr],
                "tpr": [round(float(v), 4) for v in tpr],
                "auc": auc_val,
            }
        else:
            auc_val = round(float(roc_auc_score(
                y_test, y_proba, multi_class="ovr", average="weighted"
            )), 4)
    except Exception:
        pass

    # ── Compute visualization data ────────────────────────────────────────────
    viz_data = _safe_viz(_compute_visualization(
        model, request.model,
        X_train, X_test,
        y_train, y_test,
        list(feature_cols), params_used, class_labels,
    ))

    # ── Persist for Steps 5, 6, 7 ────────────────────────────────────────────
    session_store.set(x_session_id, "trained_model", model)
    session_store.set(x_session_id, "model_name", request.model)
    session_store.set(x_session_id, "class_labels", class_labels)
    session_store.set(x_session_id, "X_test", X_test)
    session_store.set(x_session_id, "y_test", y_test)
    session_store.set(x_session_id, "feature_columns", feature_cols)
    session_store.set(x_session_id, "train_complete", True)
    # Store metrics for certificate generation (Step 7)
    session_store.set(x_session_id, "last_metrics", {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "specificity": specificity_val,
        "auc": auc_val,
    })
    # Invalidate any cached explainability / bias data from a prior run
    session_store.set(x_session_id, "feature_importance", None)
    session_store.set(x_session_id, "feature_importance_features", None)
    session_store.set(x_session_id, "patient_indices", None)
    session_store.set(x_session_id, "bias_analysis", None)

    return TrainResponse(
        model=request.model,
        params_used=params_used,
        accuracy=accuracy,
        precision=precision,
        recall=recall,
        f1=f1,
        specificity=specificity_val,
        auc=auc_val,
        roc_curve=roc_curve_data,
        confusion_matrix=cm,
        class_labels=class_labels,
        message=(
            f"{request.model.replace('_', ' ').title()} trained successfully. "
            f"Accuracy: {accuracy * 100:.1f}%"
        ),
        visualization=viz_data,
    )


@router.get(
    "/options",
    summary="Return available models and their configurable parameters",
)
def get_model_options():
    """Provides model list and parameter definitions for the Step 4 UI."""
    return {
        "models": [
            {
                "id": "knn",
                "label": "K-Nearest Neighbors (KNN)",
                "params": [
                    {"key": "n_neighbors", "label": "K — Number of Neighbors", "type": "slider", "min": 1, "max": 25, "step": 1, "default": 5},
                    {"key": "metric", "label": "Distance Metric", "type": "select", "options": [
                        {"value": "euclidean", "label": "Euclidean"},
                        {"value": "manhattan", "label": "Manhattan"},
                        {"value": "minkowski", "label": "Minkowski"},
                    ], "default": "euclidean"},
                ],
            },
            {
                "id": "svm",
                "label": "Support Vector Machine (SVM)",
                "params": [
                    {"key": "kernel", "label": "Kernel", "type": "select", "options": [
                        {"value": "linear", "label": "Linear"},
                        {"value": "rbf", "label": "RBF (Radial Basis Function)"},
                    ], "default": "linear"},
                    {"key": "C", "label": "Regularisation (C)", "type": "slider", "min": 0.01, "max": 100.0, "step": 0.01, "default": 1.0},
                    {"key": "gamma", "label": "Gamma", "type": "select", "options": [
                        {"value": "scale", "label": "Scale (default)"},
                        {"value": "auto", "label": "Auto"},
                    ], "default": "scale"},
                ],
            },
            {
                "id": "decision_tree",
                "label": "Decision Tree",
                "params": [
                    {"key": "max_depth", "label": "Maximum Depth", "type": "slider", "min": 1, "max": 20, "step": 1, "default": 5},
                    {"key": "criterion", "label": "Split Criterion", "type": "select", "options": [
                        {"value": "gini", "label": "Gini Impurity"},
                        {"value": "entropy", "label": "Entropy"},
                    ], "default": "gini"},
                    {"key": "min_samples_split", "label": "Min Samples Split", "type": "slider", "min": 2, "max": 20, "step": 1, "default": 2},
                ],
            },
            {
                "id": "random_forest",
                "label": "Random Forest",
                "params": [
                    {"key": "n_estimators", "label": "Number of Trees", "type": "slider", "min": 10, "max": 500, "step": 10, "default": 100},
                    {"key": "max_depth", "label": "Max Tree Depth", "type": "slider", "min": 1, "max": 50, "step": 1, "default": None, "nullable": True},
                    {"key": "random_state", "label": "Random State (seed)", "type": "number", "default": 42},
                ],
            },
            {
                "id": "logistic_regression",
                "label": "Logistic Regression",
                "params": [
                    {"key": "C", "label": "Regularisation Strength (C)", "type": "slider", "min": 0.01, "max": 100.0, "step": 0.01, "default": 1.0},
                    {"key": "solver", "label": "Optimization Solver", "type": "select", "options": [
                        {"value": "lbfgs", "label": "LBFGS"},
                        {"value": "liblinear", "label": "Liblinear"},
                        {"value": "saga", "label": "SAGA"},
                    ], "default": "lbfgs"},
                    {"key": "max_iter", "label": "Max Iterations", "type": "slider", "min": 10, "max": 1000, "step": 10, "default": 100},
                ],
            },
            {
                "id": "naive_bayes",
                "label": "Naïve Bayes",
                "params": [
                    {"key": "var_smoothing", "label": "Variance Smoothing", "type": "slider", "min": 1e-12, "max": 1e-3, "step": 1e-12, "default": 1e-9},
                ],
            },
        ]
    }
