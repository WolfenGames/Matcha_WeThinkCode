function matchTags(p1, p2, cb)
{
	cb(
		(p1.MatchingTags/p2.total) * 70
	)
}

function matchDist(p1, p2, cb)
{
	cb(
		((p1.Max - p2.Dist)/p1.Max) * 30
	)
}

module.exports = {
	matchTags: matchTags,
	matchDist: matchDist
}